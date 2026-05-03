"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { createClient } from "@/lib/supabase/client"
import { enrichLeadFromAddress } from "@/lib/enrich-lead"

import AIOutreachPanel from "@/components/AIOutreachPanel"
import ActionButton from "@/components/ui/ActionButton"
import LeadQuickViewDrawer from "@/components/ui/LeadQuickViewDrawer"
import ScoreRing from "@/components/ui/ScoreRing"
import StatusBadge from "@/components/ui/StatusBadge"

type FinderResult = {
  id: string
  address: string
  city: string
  state: string
  latitude: number | null
  longitude: number | null
  bedrooms: number | null
  bathrooms: number | null
  squareFootage: number | null
  yearBuilt: number | null
  propertyType: string | null
  ownerOccupied: boolean | null
  isAbsenteeOwner: boolean
  yearsOwned: number | null
  longTermOwner: boolean
  seniorOwnerLikely: boolean
  propertyAge: number | null
  ownerType: string | null
  likelyDistressed: boolean
  preforeclosure: boolean
  lastSaleDate: string | null
  score: number
  label: string
  reasons: string[]
}

type Enrichment = {
  owner_name: string | null
  owner_phone: string | null
  owner_email: string | null
  estimated_value: number | null
  lead_score: number
  lead_rating: string
  lead_signals: string
  years_owned: number | null
  long_term_owner: boolean | null
  senior_owner_likely: boolean | null
  owner_occupied: boolean | null
}

type WorkspaceProps = {
  title: string
  subtitle: string
}

const FILTER_OPTIONS = [
  'Vacant',
  'Pre-Foreclosure',
  'High Equity',
  'Absentee Owner',
  'Tax Liens',
  'Tired Landlord',
  'Recently Inherited',
] as const

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function estimateArv(enrichment?: Enrichment) {
  if (!enrichment?.estimated_value) return null
  return Math.round(enrichment.estimated_value * 1.12)
}

function estimateEquity(result: FinderResult, enrichment?: Enrichment) {
  const base = enrichment?.estimated_value
  if (!base) return null

  if ((result.yearsOwned || 0) >= 20) return Math.round(base * 0.62)
  if ((result.yearsOwned || 0) >= 10) return Math.round(base * 0.45)
  return Math.round(base * 0.28)
}

function getMotivationTag(result: FinderResult) {
  if (result.preforeclosure) return 'Pre-Foreclosure'
  if (result.likelyDistressed) return 'Distressed'
  if (result.isAbsenteeOwner) return 'Absentee'
  if (result.longTermOwner) return 'High Equity'
  return 'General'
}

function passesFilter(filter: typeof FILTER_OPTIONS[number], result: FinderResult, enrichment?: Enrichment) {
  switch (filter) {
    case 'Vacant':
      return result.ownerOccupied === false && result.likelyDistressed
    case 'Pre-Foreclosure':
      return result.preforeclosure
    case 'High Equity':
      return (result.yearsOwned || enrichment?.years_owned || 0) >= 10
    case 'Absentee Owner':
      return result.isAbsenteeOwner
    case 'Tax Liens':
      return result.longTermOwner && result.likelyDistressed
    case 'Tired Landlord':
      return result.isAbsenteeOwner && result.longTermOwner
    case 'Recently Inherited':
      return result.seniorOwnerLikely || enrichment?.senior_owner_likely === true
    default:
      return true
  }
}

function markerColor(score: number) {
  if (score >= 80) return '#8B5CF6'
  if (score >= 60) return '#7C3AED'
  return '#5B21B6'
}

export default function LeadDiscoveryWorkspace({
  title,
  subtitle,
}: WorkspaceProps) {
  const supabase = createClient()
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const [city, setCity] = useState('Phoenix')
  const [state, setState] = useState('AZ')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<FinderResult[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedLeadMap, setSavedLeadMap] = useState<Record<string, {
    id: string
    status: string
    ownerName?: string | null
    phone?: string | null
    aiSummary?: string | null
  }>>({})
  const [enrichmentMap, setEnrichmentMap] = useState<Record<string, Enrichment>>({})
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const selectedResult = useMemo(
    () => results.find((result) => result.id === selectedId) || null,
    [results, selectedId]
  )

  const selectedSavedLead = useMemo(() => {
    if (!selectedResult) return null
    const saved = savedLeadMap[selectedResult.id]
    if (!saved) return null

    const enrichment = enrichmentMap[selectedResult.id]
    return {
      id: saved.id,
      address: selectedResult.address,
      ownerName: saved.ownerName || enrichment?.owner_name,
      phone: saved.phone || enrichment?.owner_phone,
      status: saved.status,
      aiSummary: saved.aiSummary || enrichment?.lead_signals || null,
    }
  }, [selectedResult, savedLeadMap, enrichmentMap])

  const visibleResults = useMemo(() => {
    return results.filter((result) =>
      activeFilters.every((filter) => passesFilter(filter as typeof FILTER_OPTIONS[number], result, enrichmentMap[result.id]))
    )
  }, [results, activeFilters, enrichmentMap])

  const focusMapOnLead = useCallback((lead: FinderResult) => {
    if (!mapRef.current || lead.longitude == null || lead.latitude == null) return
    mapRef.current.flyTo({
      center: [lead.longitude, lead.latitude],
      zoom: 14.5,
      speed: 0.85,
    })
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-111.94, 33.4255],
      zoom: 10.4,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    visibleResults.forEach((result) => {
      if (result.longitude == null || result.latitude == null) return

      const element = document.createElement('button')
      element.type = 'button'
      element.className = `pulse-pin flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-[10px] font-semibold text-white transition-all duration-300 ${
        selectedId === result.id ? 'scale-110 shadow-[0_0_22px_rgba(124,58,237,0.5)]' : ''
      }`
      element.style.background = markerColor(result.score)
      element.style.boxShadow = `0 0 18px ${markerColor(result.score)}55`
      element.innerText = `${Math.max(1, Math.round(result.score / 10))}`
      element.onclick = () => {
        setSelectedId(result.id)
        setDetailsOpen(true)
      }

      const marker = new mapboxgl.Marker({ element })
        .setLngLat([result.longitude, result.latitude])
        .addTo(mapRef.current!)

      markersRef.current.push(marker)
    })
  }, [visibleResults, selectedId])

  useEffect(() => {
    if (!selectedResult) return
    focusMapOnLead(selectedResult)
  }, [selectedResult, focusMapOnLead])

  useEffect(() => {
    if (results.length === 0) return
    const pending = results.filter((result) => !enrichmentMap[result.id]).slice(0, 12)
    if (pending.length === 0) return

    let cancelled = false

    async function hydrate() {
      const entries = await Promise.all(
        pending.map(async (result) => {
          const enrichment = await enrichLeadFromAddress(
            `${result.address}, ${result.city}, ${result.state}`.trim()
          )
          return [result.id, enrichment] as const
        })
      )

      if (cancelled) return
      setEnrichmentMap((current) => {
        const next = { ...current }
        for (const [id, enrichment] of entries) {
          next[id] = enrichment
        }
        return next
      })
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [results, enrichmentMap])

  const runSearch = useCallback(async () => {
    setSearching(true)
    setMessage('')
    try {
      const response = await fetch("/api/finder/city", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state, limit: 35 }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Search failed.')

      const nextResults = (data.results || []) as FinderResult[]
      setResults(nextResults)
      setSelectedId(nextResults[0]?.id || null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Search failed.')
    } finally {
      setSearching(false)
    }
  }, [city, state])

  async function saveLead(result: FinderResult) {
    setSavingId(result.id)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please log in first.')
      setSavingId(null)
      return
    }

    const enrichment =
      enrichmentMap[result.id] ||
      (await enrichLeadFromAddress(`${result.address}, ${result.city}, ${result.state}`.trim()))

    setEnrichmentMap((current) => ({ ...current, [result.id]: enrichment }))

    const { data: insertedLead, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        address: result.address,
        property_address: result.address,
        city: result.city,
        state: result.state,
        zip: null,
        zip_code: null,
        phone: enrichment.owner_phone,
        email: enrichment.owner_email,
        source: 'finder',
        status: 'new_lead',
        notes: `Imported from discovery workspace. Score: ${result.score}/100 (${result.label}). Reasons: ${result.reasons.join(', ')}`,
        latitude: result.latitude,
        longitude: result.longitude,
        owner_name: enrichment.owner_name,
        owner_occupied: result.ownerOccupied,
        is_absentee_owner: result.isAbsenteeOwner,
        years_owned: result.yearsOwned,
        long_term_owner: result.longTermOwner,
        senior_owner_likely: result.seniorOwnerLikely,
        property_age: result.propertyAge,
        owner_type: result.ownerType,
        likely_distressed: result.likelyDistressed,
        last_sale_date: result.lastSaleDate,
        bedrooms: result.bedrooms,
        bathrooms: result.bathrooms,
        square_footage: result.squareFootage,
        estimated_value: enrichment.estimated_value,
        owner_phone: enrichment.owner_phone,
        owner_email: enrichment.owner_email,
        lead_score: enrichment.lead_score || result.score,
        total_score: enrichment.lead_score || result.score,
        lead_rating: enrichment.lead_rating || result.label,
        lead_signals: enrichment.lead_signals || result.reasons.join(', '),
        ai_summary: enrichment.lead_signals || result.reasons.join(', '),
        ai_analysis: enrichment.lead_signals || result.reasons.join(', '),
      })
      .select('id')
      .single()

    setSavingId(null)

    if (error || !insertedLead) {
      setMessage(error?.message || 'Could not save lead.')
      return
    }

    await supabase.from('contact_attempts').insert({
      lead_id: insertedLead.id,
      method: 'workflow',
      message: `CRM lead created from Finder workspace. Grade: ${enrichment.lead_score || result.score}/100.`,
      status: 'logged',
    })

    setSavedLeadMap((current) => ({
      ...current,
      [result.id]: {
        id: insertedLead.id,
        status: 'new_lead',
        ownerName: enrichment.owner_name,
        phone: enrichment.owner_phone,
        aiSummary: enrichment.lead_signals,
      },
    }))
    setMessage('Lead saved. Open AI Outreach when you are ready to start the conversation.')
  }

  function toggleFilter(filter: string) {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]
    )
  }

  useEffect(() => {
    if (results.length === 0 && city && state) {
      void runSearch()
    }
  }, [results.length, city, state, runSearch])

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[#2A2A2A] bg-[#121212] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B5CF6]">
              Finder Workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
            <p className="mt-1 text-sm text-[#A1A1AA]">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="secondary" onClick={() => void runSearch()}>
              {searching ? 'Refreshing...' : 'Refresh Leads'}
            </ActionButton>
            <ActionButton variant="primary" onClick={() => setAiOpen(true)} disabled={!selectedSavedLead}>
              Open AI Outreach
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="flex min-h-[calc(100vh-210px)] flex-col overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#121212]">
          <div className="border-b border-[#2A2A2A] p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px]">
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="City"
                className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#7C3AED]/40"
              />
              <input
                value={state}
                onChange={(event) => setState(event.target.value)}
                placeholder="State"
                className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#7C3AED]/40"
              />
              <ActionButton variant="primary" onClick={() => void runSearch()}>
                {searching ? 'Searching...' : 'Search'}
              </ActionButton>
            </div>

            <details className="mt-3 rounded-xl border border-[#2A2A2A] bg-[#1F1F1F]">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white">
                Filters
              </summary>
              <div className="flex flex-wrap gap-2 border-t border-[#2A2A2A] px-4 py-4">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => toggleFilter(filter)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-300 ${
                      activeFilters.includes(filter)
                        ? 'border-[#7C3AED]/30 bg-[#7C3AED]/16 text-white shadow-[0_0_18px_rgba(124,58,237,0.2)]'
                        : 'border-[#2A2A2A] bg-[#0A0A0A] text-[#A1A1AA] hover:border-[#7C3AED]/20 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </details>
            {message ? <p className="mt-3 text-sm text-[#A1A1AA]">{message}</p> : null}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {visibleResults.map((result) => {
              const enrichment = enrichmentMap[result.id]
              const saved = savedLeadMap[result.id]
              const arv = estimateArv(enrichment)
              const equity = estimateEquity(result, enrichment)
              const selected = selectedId === result.id

              return (
                <article
                  key={result.id}
                  className={`hover-lift rounded-xl border p-3 transition-all duration-300 ${
                    selected
                      ? 'border-[#7C3AED]/30 bg-[#1F1F1F] shadow-[0_0_26px_rgba(124,58,237,0.16)]'
                      : 'border-[#2A2A2A] bg-[#1F1F1F] hover:border-[#7C3AED]/16'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(result.id)
                      focusMapOnLead(result)
                    }}
                    className="block w-full text-left"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_55%),#0A0A0A] text-lg font-semibold text-white">
                        PS
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="line-clamp-1 text-sm font-semibold text-white">{result.address}</p>
                            <p className="mt-1 text-xs text-[#A1A1AA]">
                              {result.city}, {result.state}
                            </p>
                          </div>
                          <ScoreRing score={enrichment?.lead_score || result.score} label="Grade" size={68} />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#A1A1AA]">
                          <span>Owner: {enrichment?.owner_name || 'Loading owner...'}</span>
                          <span>Value: {formatMoney(enrichment?.estimated_value)}</span>
                          <span>ARV: {formatMoney(arv)}</span>
                          <span>Equity: {formatMoney(equity)}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-2.5 py-1 text-[11px] text-white">
                            {getMotivationTag(result)}
                          </span>
                          <span className="rounded-xl border border-[#7C3AED]/20 bg-[#7C3AED]/12 px-2.5 py-1 text-[11px] text-[#E9D5FF]">
                            {enrichment?.lead_rating || result.label}
                          </span>
                          {saved ? <StatusBadge status={saved.status} /> : null}
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButton
                      variant="primary"
                      size="sm"
                      onClick={() => void saveLead(result)}
                      disabled={Boolean(saved) || savingId === result.id}
                    >
                      {saved ? 'Saved' : savingId === result.id ? 'Saving...' : 'Save Lead'}
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedId(result.id)
                        setDetailsOpen(true)
                      }}
                    >
                      View Details
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (!saved) return
                        setSelectedId(result.id)
                        setAiOpen(true)
                      }}
                      disabled={!saved}
                    >
                      Send Text
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (!saved) return
                        setSelectedId(result.id)
                        setAiOpen(true)
                      }}
                      disabled={!saved}
                    >
                      Start AI Outreach
                    </ActionButton>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="relative min-h-[calc(100vh-210px)] overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#121212]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-[#2A2A2A] bg-[#121212]/92 px-4 py-3 backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold text-white">Lead Map</p>
              <p className="text-xs text-[#A1A1AA]">
                Click a card to focus the marker. Click a marker to open details.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton variant="secondary" size="sm">
                Export
              </ActionButton>
            </div>
          </div>
          <div ref={mapContainer} className="h-full min-h-[calc(100vh-210px)]" />
        </div>
      </section>

      <button
        type="button"
        onClick={() => setAiOpen(true)}
        disabled={!selectedSavedLead}
        className="fixed bottom-6 right-6 z-30 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,58,237,0.28)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#8B5CF6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Open AI Outreach
      </button>

      <LeadQuickViewDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        lead={
          selectedResult
            ? {
                id: savedLeadMap[selectedResult.id]?.id,
                ownerName: enrichmentMap[selectedResult.id]?.owner_name,
                address: selectedResult.address,
                city: selectedResult.city,
                state: selectedResult.state,
                phone: enrichmentMap[selectedResult.id]?.owner_phone,
                score: enrichmentMap[selectedResult.id]?.lead_score || selectedResult.score,
                status: savedLeadMap[selectedResult.id]?.status || null,
                summary:
                  enrichmentMap[selectedResult.id]?.lead_signals ||
                  selectedResult.reasons.join(', '),
              }
            : null
        }
      >
        {selectedResult ? (
          <div className="rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] p-4">
            <div className="grid grid-cols-2 gap-3 text-sm text-[#A1A1AA]">
              <span>Estimated Value: {formatMoney(enrichmentMap[selectedResult.id]?.estimated_value)}</span>
              <span>ARV: {formatMoney(estimateArv(enrichmentMap[selectedResult.id]))}</span>
              <span>Equity: {formatMoney(estimateEquity(selectedResult, enrichmentMap[selectedResult.id]))}</span>
              <span>Motivation: {getMotivationTag(selectedResult)}</span>
            </div>
          </div>
        ) : null}
      </LeadQuickViewDrawer>

      <AIOutreachPanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        lead={selectedSavedLead}
      />
    </div>
  )
}
