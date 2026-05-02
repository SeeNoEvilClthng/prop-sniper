'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useRouter } from 'next/navigation'

import LeadOutreachActions from '@/components/LeadOutreachActions'
import ActionButton from '@/components/ui/ActionButton'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { createClient } from '@/lib/supabase/client'
import { enrichLeadFromAddress } from '@/lib/enrich-lead'

type SearchResult = {
  id: string
  place_name: string
  center: [number, number]
  properties?: {
    full_address?: string
    name?: string
    context?: {
      place?: { name?: string }
      region?: { name?: string }
      postcode?: { name?: string }
    }
  }
}

type Lead = {
  id: string
  address: string
  city: string | null
  state: string | null
  status: string | null
  latitude: number | null
  longitude: number | null
  lead_score: number | null
  ai_summary?: string | null
  owner_name?: string | null
  owner_phone?: string | null
}

type DraftLead = {
  address: string
  city: string
  state: string
  zipCode: string
  lat: number
  lng: number
}

function extractZipCode(...values: Array<string | undefined | null>) {
  for (const value of values) {
    if (!value) continue
    const match = value.match(/\b\d{5}(?:-\d{4})?\b/)
    if (match) return match[0]
  }

  return ''
}

function getMarkerColor(score?: number | null) {
  if ((score || 0) >= 80) return '#22c55e'
  if ((score || 0) >= 60) return '#f59e0b'
  return '#f43f5e'
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const draftMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const leadMarkersRef = useRef<mapboxgl.Marker[]>([])

  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState('')
  const [savedLeads, setSavedLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [draftLead, setDraftLead] = useState<DraftLead | null>(null)
  const [saving, setSaving] = useState(false)

  const visibleLeads = useMemo(
    () => savedLeads.filter((lead) => lead.latitude != null && lead.longitude != null),
    [savedLeads]
  )

  const loadLeads = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('id, address, city, state, status, latitude, longitude, lead_score, ai_summary, owner_name, owner_phone')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    setSavedLeads((data || []) as Lead[])
  }, [supabase])

  useEffect(() => {
    void loadLeads()
  }, [loadLeads])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-111.94, 33.4255],
      zoom: 11,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('click', async (event) => {
      const lng = event.lngLat.lng
      const lat = event.lngLat.lat

      setSelectedLead(null)
      setMessage('')

      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove()
      }

      draftMarkerRef.current = new mapboxgl.Marker({ color: '#a855f7' })
        .setLngLat([lng, lat])
        .addTo(map)

      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}`
        )
        const data = await response.json()
        const feature = data.features?.[0]
        const props = feature?.properties || {}
        const context = props.context || {}
        const fullAddress = props.full_address || props.name || ''
        const parts = fullAddress.split(',').map((part: string) => part.trim())

        setDraftLead({
          address: props.name || parts[0] || '',
          city: context.place?.name || parts[1] || '',
          state: context.region?.name || parts[2] || '',
          zipCode: extractZipCode(context.postcode?.name, props.full_address, feature?.place_name),
          lat,
          lng,
        })
      } catch {
        setDraftLead({
          address: '',
          city: '',
          state: '',
          zipCode: '',
          lat,
          lng,
        })
      }
    })

    mapRef.current = map

    return () => {
      leadMarkersRef.current.forEach((marker) => marker.remove())
      draftMarkerRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    leadMarkersRef.current.forEach((marker) => marker.remove())
    leadMarkersRef.current = []

    visibleLeads.forEach((lead) => {
      if (lead.latitude == null || lead.longitude == null) return

      const markerElement = document.createElement('button')
      markerElement.type = 'button'
      markerElement.className = 'h-4 w-4 rounded-full ring-4 ring-white/10'
      markerElement.style.backgroundColor = getMarkerColor(lead.lead_score)
      markerElement.style.boxShadow = `0 0 16px ${getMarkerColor(lead.lead_score)}`
      markerElement.addEventListener('click', () => {
        setSelectedLead(lead)
        setDraftLead(null)
      })

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([lead.longitude, lead.latitude])
        .addTo(mapRef.current!)

      leadMarkersRef.current.push(marker)
    })
  }, [visibleLeads])

  async function handleSearch(value: string) {
    setSearch(value)

    if (value.trim().length < 3) {
      setResults([])
      return
    }

    setSearching(true)
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${token}&autocomplete=true&limit=5`
      )
      const data = await response.json()
      setResults(data.features || [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  function handleSelectResult(result: SearchResult) {
    const lng = result.center[0]
    const lat = result.center[1]
    const fullPlace = result.place_name || ''
    const parts = fullPlace.split(',').map((part) => part.trim())
    const streetAddress =
      result.properties?.name ||
      result.properties?.full_address?.split(',')[0] ||
      parts[0] ||
      ''
    const guessedCity = result.properties?.context?.place?.name || parts[1] || ''
    const guessedState = result.properties?.context?.region?.name || parts[2] || ''

    setSelectedLead(null)
    setDraftLead({
      address: streetAddress,
      city: guessedCity,
      state: guessedState,
      zipCode: extractZipCode(
        result.properties?.context?.postcode?.name,
        result.properties?.full_address,
        result.place_name
      ),
      lat,
      lng,
    })

    setResults([])
    setSearch(result.place_name)

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 16 })
    }

    if (draftMarkerRef.current) {
      draftMarkerRef.current.remove()
    }

    if (mapRef.current) {
      draftMarkerRef.current = new mapboxgl.Marker({ color: '#a855f7' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current)
    }
  }

  async function handleSaveLead() {
    if (!draftLead) {
      setMessage('Select a property on the map first.')
      return
    }

    setSaving(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please log in first.')
      setSaving(false)
      return
    }

    const fullAddress = `${draftLead.address}, ${draftLead.city}, ${draftLead.state} ${draftLead.zipCode}`.trim()
    const enriched = await enrichLeadFromAddress(fullAddress)

    const { data: insertedLead, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        address: draftLead.address,
        property_address: draftLead.address,
        city: draftLead.city,
        state: draftLead.state,
        zip: draftLead.zipCode || null,
        zip_code: draftLead.zipCode || null,
        status: 'new_lead',
        source: 'map',
        latitude: draftLead.lat,
        longitude: draftLead.lng,
        owner_name: enriched.owner_name,
        owner_occupied: enriched.owner_occupied,
        is_absentee_owner: enriched.is_absentee_owner,
        years_owned: enriched.years_owned,
        long_term_owner: enriched.long_term_owner,
        senior_owner_likely: enriched.senior_owner_likely,
        property_age: enriched.property_age,
        owner_type: enriched.owner_type,
        likely_distressed: enriched.likely_distressed,
        bedrooms: enriched.bedrooms,
        bathrooms: enriched.bathrooms,
        estimated_value: enriched.estimated_value,
        last_sale_date: enriched.last_sale_date,
        phone: enriched.owner_phone,
        owner_phone: enriched.owner_phone,
        email: enriched.owner_email,
        owner_email: enriched.owner_email,
        lead_score: enriched.lead_score,
        total_score: enriched.lead_score,
        lead_rating: enriched.lead_rating,
        lead_signals: enriched.lead_signals,
        ai_summary: enriched.lead_signals,
        ai_analysis: enriched.lead_signals,
      })
      .select('id')
      .single()

    setSaving(false)

    if (error || !insertedLead?.id) {
      setMessage(error?.message || 'Could not save lead.')
      return
    }

    await supabase.from('contact_attempts').insert({
      lead_id: insertedLead.id,
      method: 'workflow',
      message: `CRM lead created from Map. Grade: ${enriched.lead_score}/100.`,
      status: 'logged',
    })

    router.push(`/dashboard/${insertedLead.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Map"
        title="Visual lead hunting"
        description="Keep the map front and center. Click a property to save a lead, or open a saved lead’s outreach lane right from the map."
        helper="Only AI call sellers after they reply."
        actions={
          <>
            <ActionButton href="/finder" variant="secondary">
              Finder
            </ActionButton>
            <ActionButton href="/leads?view=pipeline" variant="primary">
              CRM
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative min-h-[72vh] overflow-hidden rounded-3xl border border-white/8 bg-[#05070d]">
          <div className="absolute left-4 top-4 z-10 w-full max-w-sm">
            <input
              value={search}
              onChange={(event) => void handleSearch(event.target.value)}
              placeholder="Search address or neighborhood"
              className="w-full rounded-xl border border-white/10 bg-[#0b0f17]/95 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/30"
            />

            {searching ? (
              <div className="mt-2 rounded-xl border border-white/10 bg-[#0b0f17]/95 px-4 py-3 text-sm text-slate-300">
                Searching...
              </div>
            ) : null}

            {results.length > 0 ? (
              <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f17]/95">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="block w-full border-b border-white/8 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/[0.04] last:border-b-0"
                  >
                    {result.place_name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div ref={mapContainer} className="min-h-[72vh]" />
        </div>

        <aside className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
          {selectedLead ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-violet-200/80">
                  Saved Lead
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{selectedLead.address}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {[selectedLead.city, selectedLead.state].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedLead.status} />
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                  Score {selectedLead.lead_score ?? '—'}
                </span>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Owner</p>
                <p className="mt-2 text-sm text-white">{selectedLead.owner_name || 'Owner not saved'}</p>
                <p className="mt-1 text-sm text-slate-300">{selectedLead.owner_phone || 'No phone on file'}</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">AI Summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {selectedLead.ai_summary || 'No AI summary saved yet.'}
                </p>
              </div>

              <LeadOutreachActions
                leadId={selectedLead.id}
                propertyAddress={selectedLead.address}
                status={selectedLead.status}
                phone={selectedLead.owner_phone}
              />

              <div className="flex flex-wrap gap-2">
                <ActionButton href={`/dashboard/${selectedLead.id}`} variant="secondary">
                  View Details
                </ActionButton>
              </div>
            </div>
          ) : draftLead ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-violet-200/80">
                  New Lead
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {draftLead.address || 'Selected property'}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {[draftLead.city, draftLead.state, draftLead.zipCode].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm leading-6 text-slate-300">
                  Save this property to create the CRM lead. Once the lead is saved, you can send the first safe text and start the outreach workflow.
                </p>
              </div>

              <div className="grid gap-3">
                <label className="text-sm text-slate-300">
                  Address
                  <input
                    value={draftLead.address}
                    onChange={(event) =>
                      setDraftLead((current) =>
                        current ? { ...current, address: event.target.value } : current
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm text-slate-300">
                    City
                    <input
                      value={draftLead.city}
                      onChange={(event) =>
                        setDraftLead((current) =>
                          current ? { ...current, city: event.target.value } : current
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    State
                    <input
                      value={draftLead.state}
                      onChange={(event) =>
                        setDraftLead((current) =>
                          current ? { ...current, state: event.target.value } : current
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    ZIP
                    <input
                      value={draftLead.zipCode}
                      onChange={(event) =>
                        setDraftLead((current) =>
                          current ? { ...current, zipCode: event.target.value } : current
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionButton variant="primary" onClick={handleSaveLead} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Lead'}
                </ActionButton>
              </div>

              {message ? <p className="text-sm text-slate-300">{message}</p> : null}
            </div>
          ) : (
            <EmptyState
              title="Select a property"
              description="Click a property on the map or search an address. The slide-out panel will keep the next step simple."
            />
          )}
        </aside>
      </section>
    </div>
  )
}
