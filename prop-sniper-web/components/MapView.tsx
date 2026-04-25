'use client'

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { enrichLeadFromAddress } from '@/lib/enrich-lead'

type SelectedPoint = {
  lng: number
  lat: number
}

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
  notes: string | null
  latitude: number | null
  longitude: number | null
  lead_score: number | null
  lead_rating: string | null
  lead_signals: string | null
}

type MarkerTone = {
  label: string
  className: string
  accent: string
}

function getMarkerTone(leadScore: number | null): MarkerTone {
  if ((leadScore || 0) >= 85) {
    return { label: 'Elite', className: 'deal-marker--elite', accent: '#22c55e' }
  }
  if ((leadScore || 0) >= 70) {
    return { label: 'Strong', className: 'deal-marker--strong', accent: '#eab308' }
  }
  if ((leadScore || 0) >= 50) {
    return { label: 'Watch', className: 'deal-marker--watch', accent: '#fb7185' }
  }
  return { label: 'Weak', className: 'deal-marker--weak', accent: '#64748b' }
}

function getSignalList(lead: Lead) {
  return (lead.lead_signals || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function buildPopupHtml(lead: Lead) {
  const tone = getMarkerTone(lead.lead_score)
  const signals = getSignalList(lead)
    .map(
      (signal) =>
        `<span style="display:inline-flex;border-radius:999px;padding:4px 8px;border:1px solid rgba(196,181,253,.18);background:rgba(168,85,247,.12);font-size:11px;color:#ddd6fe;">${signal}</span>`
    )
    .join(' ')

  return `
    <div style="min-width:250px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div>
          <p style="font-weight:700; margin:0 0 6px 0; color:#ffffff;">${lead.address}</p>
          <p style="margin:0; font-size:13px; color:#94a3b8;">
            ${lead.city || ''}${lead.city && lead.state ? ', ' : ''}${lead.state || ''}
          </p>
        </div>
        <span style="border-radius:999px;padding:6px 10px;border:1px solid ${tone.accent}55;background:${tone.accent}22;color:#ffffff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">
          ${tone.label}
        </span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;">
        <div style="padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;">Deal Score</p>
          <p style="margin:6px 0 0 0;font-size:18px;font-weight:700;color:#f8fafc;">${lead.lead_score ?? '—'}</p>
        </div>
        <div style="padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;">Status</p>
          <p style="margin:6px 0 0 0;font-size:14px;font-weight:600;color:#f8fafc;">${lead.status || 'New'}</p>
        </div>
      </div>
      ${
        signals
          ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;">${signals}</div>`
          : ''
      }
      <a href="/dashboard/${lead.id}" style="display:inline-flex;margin-top:14px;border-radius:999px;padding:10px 14px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#faf5ff;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">
        Open Lead
      </a>
    </div>
  `
}

function createMarkerElement(leadScore: number | null, sniperMode: boolean) {
  const tone = getMarkerTone(leadScore)
  const element = document.createElement('div')
  element.className = `deal-marker ${tone.className}${sniperMode ? ' deal-marker--sniper' : ''}`
  element.innerHTML = '<span class="deal-marker-pulse"></span><span class="deal-marker-core"></span>'
  return element
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const leadMarkersRef = useRef<mapboxgl.Marker[]>([])

  const supabase = createClient()
  const router = useRouter()

  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null)
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [status, setStatus] = useState('New')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const [savedLeads, setSavedLeads] = useState<Lead[]>([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [sniperMode, setSniperMode] = useState(false)

  const filteredLeads = useMemo(() => {
    const statusScoped =
      statusFilter === 'All'
        ? savedLeads
        : savedLeads.filter((lead) => (lead.status || 'New') === statusFilter)

    if (!sniperMode) return statusScoped

    return statusScoped.filter((lead) => (lead.lead_score || 0) >= 70)
  }, [savedLeads, statusFilter, sniperMode])

  const mapStats = useMemo(() => {
    const total = filteredLeads.length
    const elite = filteredLeads.filter((lead) => (lead.lead_score || 0) >= 85).length
    const strong = filteredLeads.filter((lead) => {
      const score = lead.lead_score || 0
      return score >= 70 && score < 85
    }).length
    const watch = filteredLeads.filter((lead) => {
      const score = lead.lead_score || 0
      return score >= 50 && score < 70
    }).length

    return { total, elite, strong, watch }
  }, [filteredLeads])

  const fetchSavedLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('id, address, city, state, status, notes, latitude, longitude, lead_score, lead_rating, lead_signals')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      console.error(error)
      return
    }

    setSavedLeads((data || []) as Lead[])
  }, [supabase])

  const reverseGeocode = useEffectEvent(async (lng: number, lat: number) => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const res = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}`
      )
      const data = await res.json()

      const feature = data.features?.[0]
      const props = feature?.properties || {}
      const context = props.context || {}

      const fullAddress = props.full_address || props.name || ''
      const parts = fullAddress.split(',').map((part: string) => part.trim())

      setAddress(props.name || parts[0] || '')
      setCity(context.place?.name || parts[1] || '')
      setState(context.region?.name || parts[2] || '')
      setZipCode(context.postcode?.name || '')
    } catch {
      setAddress('')
      setCity('')
      setState('')
      setZipCode('')
    }
  })

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-111.94, 33.4255],
      zoom: 11,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('click', async (e) => {
      const lng = e.lngLat.lng
      const lat = e.lngLat.lat

      setSelectedPoint({ lng, lat })
      setMessage('')

      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove()
      }

      selectedMarkerRef.current = new mapboxgl.Marker({ color: 'black' })
        .setLngLat([lng, lat])
        .addTo(map)

      await reverseGeocode(lng, lat)
    })

    mapRef.current = map

    return () => {
      leadMarkersRef.current.forEach((marker) => marker.remove())
      if (selectedMarkerRef.current) selectedMarkerRef.current.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    mapRef.current.setStyle(
      sniperMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12'
    )
  }, [sniperMode])

  useEffect(() => {
    async function loadInitialLeads() {
      const { data, error } = await supabase
        .from('leads')
        .select('id, address, city, state, status, notes, latitude, longitude, lead_score, lead_rating, lead_signals')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) {
        console.error(error)
        return
      }

      setSavedLeads((data || []) as Lead[])
    }

    void loadInitialLeads()
  }, [supabase])

  useEffect(() => {
    if (!mapRef.current) return

    leadMarkersRef.current.forEach((marker) => marker.remove())
    leadMarkersRef.current = []

    filteredLeads.forEach((lead) => {
      if (lead.latitude == null || lead.longitude == null) return

      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(buildPopupHtml(lead))

      const marker = new mapboxgl.Marker({
        element: createMarkerElement(lead.lead_score, sniperMode),
      })
        .setLngLat([lead.longitude, lead.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!)

      leadMarkersRef.current.push(marker)
    })
  }, [filteredLeads, sniperMode])

  async function handleSearch(value: string) {
    setSearch(value)

    if (value.trim().length < 3) {
      setResults([])
      return
    }

    setSearching(true)

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${token}&autocomplete=true&limit=5`
      )
      const data = await res.json()
      setResults(data.features || [])
    } catch {
      setResults([])
    }

    setSearching(false)
  }

  function handleSelectResult(result: SearchResult) {
    const lng = result.center[0]
    const lat = result.center[1]

    setSelectedPoint({ lng, lat })
    setMessage('')

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 16,
      })
    }

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove()
    }

    if (mapRef.current) {
      selectedMarkerRef.current = new mapboxgl.Marker({ color: 'black' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current)
    }

    const fullPlace = result.place_name || ''
    const parts = fullPlace.split(',').map((part) => part.trim())

    const streetAddress =
      result.properties?.name ||
      result.properties?.full_address?.split(',')[0] ||
      parts[0] ||
      ''

    const guessedCity =
      result.properties?.context?.place?.name ||
      parts[1] ||
      ''

    const guessedStateRaw =
      result.properties?.context?.region?.name ||
      parts[2] ||
      ''

    const guessedState = guessedStateRaw.split(' ')[0]
    const guessedZip = result.properties?.context?.postcode?.name || ''

    setAddress(streetAddress)
    setCity(guessedCity)
    setState(guessedState)
    setZipCode(guessedZip)

    setSearch(result.place_name)
    setResults([])
  }

  function focusLead(lead: Lead) {
    if (!mapRef.current || lead.latitude == null || lead.longitude == null) return

    mapRef.current.flyTo({
      center: [lead.longitude, lead.latitude],
      zoom: 16,
    })

    const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(buildPopupHtml(lead))

    new mapboxgl.Marker({ element: createMarkerElement(lead.lead_score, sniperMode) })
      .setLngLat([lead.longitude, lead.latitude])
      .setPopup(popup)
      .addTo(mapRef.current)
      .togglePopup()
  }

  function clearSelection() {
    setSelectedPoint(null)
    setAddress('')
    setCity('')
    setState('')
    setZipCode('')
    setStatus('New')
    setNotes('')
    setMessage('')
    setSearch('')
    setResults([])

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove()
      selectedMarkerRef.current = null
    }
  }

  async function handleSaveLead(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please log in first.')
      return
    }

    if (!selectedPoint) {
      setMessage('Search an address or click the map first.')
      return
    }

    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`.trim()
    const enriched = await enrichLeadFromAddress(fullAddress)

    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      address,
      city,
      state,
      zip_code: zipCode || null,
      status,
      notes,
      latitude: selectedPoint.lat,
      longitude: selectedPoint.lng,

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
      owner_phone: enriched.owner_phone,
      owner_email: enriched.owner_email,

      lead_score: enriched.lead_score,
      lead_rating: enriched.lead_rating,
      lead_signals: enriched.lead_signals,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Lead saved successfully.')
    await fetchSavedLeads()

    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 700)
  }

  return (
    <div className="luxe-panel edge-glow rounded-[28px] p-4 text-white">
      <div className="grid min-h-[75vh] grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="relative min-h-[60vh] overflow-hidden rounded-[24px] border border-white/10 bg-[#05070f]">
          <div className="absolute left-4 top-4 z-10 w-[320px]">
            <input
              className="glass-input w-full rounded-2xl p-3 shadow-[0_18px_44px_rgba(0,0,0,0.28)]"
              placeholder="Search address"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {searching && (
              <div className="glass-input mt-2 rounded-2xl p-3 text-sm text-slate-200 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
                Searching...
              </div>
            )}

            {results.length > 0 && (
              <div className="glass-input mt-2 overflow-hidden rounded-2xl shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="block w-full border-b border-white/6 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5 last:border-b-0"
                  >
                    {result.place_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 z-10 w-[280px] rounded-[22px] border border-white/10 bg-[#090d18]/84 p-4 shadow-[0_26px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-violet-200/80">Map Intel</p>
                <p className="mt-1 text-sm font-semibold text-white">Lead Score Radar</p>
              </div>
              <button
                type="button"
                onClick={() => setSniperMode((current) => !current)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  sniperMode
                    ? 'bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/40'
                    : 'bg-white/8 text-slate-300 ring-1 ring-white/10'
                }`}
              >
                {sniperMode ? 'Sniper Mode On' : 'Sniper Mode'}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Visible</p>
                <p className="mt-2 text-lg font-semibold text-white">{mapStats.total}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Elite</p>
                <p className="mt-2 text-lg font-semibold text-emerald-300">{mapStats.elite}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Strong</p>
                <p className="mt-2 text-lg font-semibold text-amber-300">{mapStats.strong}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(34,197,94,0.5)]" />
                <span className="text-slate-200">Elite deal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_18px_rgba(250,204,21,0.4)]" />
                <span className="text-slate-200">Strong deal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.4)]" />
                <span className="text-slate-200">Watchlist</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-500 shadow-[0_0_18px_rgba(100,116,139,0.25)]" />
                <span className="text-slate-200">Low conviction</span>
              </div>
            </div>
          </div>

          <div ref={mapContainer} className="min-h-[60vh]" />
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-semibold text-white">Map Lead Capture</h2>
            <p className="mt-2 text-sm text-slate-300">
              Search an address or click the map to save a lead.
            </p>

            <form onSubmit={handleSaveLead} className="mt-6 space-y-4">
              <input
                className="glass-input w-full rounded-2xl p-3"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input
                className="glass-input w-full rounded-2xl p-3"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                className="glass-input w-full rounded-2xl p-3"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />

              <input
                className="glass-input w-full rounded-2xl p-3"
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />

              <select
                className="glass-input w-full rounded-2xl p-3"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>New</option>
                <option>Contacted</option>
                <option>Follow Up</option>
                <option>Negotiating</option>
                <option>Under Contract</option>
                <option>Dead</option>
              </select>

              <textarea
                className="glass-input w-full rounded-2xl p-3"
                rows={4}
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {selectedPoint && (
                <div className="rounded-2xl border border-violet-400/14 bg-violet-500/8 p-3 text-sm">
                  <p className="font-medium text-white">Selected Property</p>
                  <p className="mt-1">{address || 'No address found yet'}</p>
                  <p className="text-slate-300">
                    {city || 'Unknown city'}, {state || 'Unknown state'} {zipCode || ''}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Pin: {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={clearSelection}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                Clear Selection
              </button>

              <button
                type="submit"
                className="neon-button w-full rounded-2xl p-3 text-sm font-semibold"
              >
                Save Lead from Map
              </button>

              {message && <p className="text-sm text-violet-200">{message}</p>}
            </form>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <label className="mb-2 block text-sm font-medium text-white">Filter Map Leads</label>
            <select
              className="glass-input w-full rounded-2xl p-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Follow Up</option>
              <option>Negotiating</option>
              <option>Under Contract</option>
              <option>Dead</option>
            </select>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Saved Leads</h2>
              <span className="text-sm text-slate-400">{filteredLeads.length} shown</span>
            </div>

            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {filteredLeads.length === 0 && (
                <p className="text-sm text-slate-400">No saved leads yet.</p>
              )}

              {filteredLeads.map((lead) => (
                <div key={lead.id} className="hover-float rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{lead.address}</p>
                      <p className="text-sm text-slate-400">
                        {lead.city || 'Unknown city'}, {lead.state || 'Unknown state'}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        backgroundColor: `${getMarkerTone(lead.lead_score).accent}22`,
                        border: `1px solid ${getMarkerTone(lead.lead_score).accent}44`,
                        color: '#f8fafc',
                      }}
                    >
                      {getMarkerTone(lead.lead_score).label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/8 bg-black/20 p-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Status</p>
                      <p className="mt-1 text-sm text-white">{lead.status || 'New'}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/20 p-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Score</p>
                      <p className="mt-1 text-sm text-white">{lead.lead_score ?? '—'}</p>
                    </div>
                  </div>

                  {getSignalList(lead).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getSignalList(lead).map((signal) => (
                        <span
                          key={`${lead.id}-${signal}`}
                          className="rounded-full border border-violet-400/18 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-100"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => focusLead(lead)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                      View on Map
                    </button>

                    <a
                      href={`/dashboard/${lead.id}`}
                      className="neon-button rounded-xl px-3 py-2 text-sm"
                    >
                      Open Lead
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
