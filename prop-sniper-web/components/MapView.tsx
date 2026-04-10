'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

function getMarkerColor(leadScore: number | null) {
  if ((leadScore || 0) >= 85) return 'red'
  if ((leadScore || 0) >= 70) return 'orange'
  if ((leadScore || 0) >= 55) return 'blue'
  if ((leadScore || 0) >= 40) return 'gray'
  return 'black'
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

  const filteredLeads = useMemo(() => {
    if (statusFilter === 'All') return savedLeads
    return savedLeads.filter((lead) => (lead.status || 'New') === statusFilter)
  }, [savedLeads, statusFilter])

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
    fetchSavedLeads()
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    leadMarkersRef.current.forEach((marker) => marker.remove())
    leadMarkersRef.current = []

    filteredLeads.forEach((lead) => {
      if (lead.latitude == null || lead.longitude == null) return

      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(`
        <div style="min-width:220px;">
          <p style="font-weight:600; margin:0 0 6px 0;">${lead.address}</p>
          <p style="margin:0 0 8px 0; font-size:13px; color:#666;">
            ${lead.city || ''}${lead.city && lead.state ? ', ' : ''}${lead.state || ''}
          </p>
          <p style="margin:0 0 8px 0; font-size:13px;">
            <strong>Score:</strong> ${lead.lead_score ?? '—'}
          </p>
          <a href="/dashboard/${lead.id}" style="color:#2563eb; font-size:13px;">
            Open Lead
          </a>
        </div>
      `)

      const marker = new mapboxgl.Marker({
        color: getMarkerColor(lead.lead_score),
      })
        .setLngLat([lead.longitude, lead.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!)

      leadMarkersRef.current.push(marker)
    })
  }, [filteredLeads])

  async function fetchSavedLeads() {
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

  async function reverseGeocode(lng: number, lat: number) {
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
  }

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

    const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(`
      <div>
        <p style="font-weight:600; margin:0 0 6px 0;">${lead.address}</p>
        <p style="margin:0 0 8px 0; font-size:13px; color:#666;">
          ${lead.city || ''}${lead.city && lead.state ? ', ' : ''}${lead.state || ''}
        </p>
        <p style="margin:0 0 8px 0; font-size:13px;">
          <strong>Score:</strong> ${lead.lead_score ?? '—'}
        </p>
        <a href="/dashboard/${lead.id}" style="color:#2563eb; font-size:13px;">
          View Lead
        </a>
      </div>
    `)

    new mapboxgl.Marker({ color: 'black' })
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
    <div className="rounded-2xl border bg-white p-4">
      <div className="grid min-h-[75vh] grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="relative min-h-[60vh] overflow-hidden rounded-2xl border">
          <div className="absolute left-4 top-4 z-10 w-[320px]">
            <input
              className="w-full rounded-xl border bg-white p-3 shadow"
              placeholder="Search address"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {searching && (
              <div className="mt-2 rounded-xl bg-white p-3 text-sm shadow">
                Searching...
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-xl border bg-white shadow">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="block w-full border-b px-4 py-3 text-left text-sm hover:bg-gray-50 last:border-b-0"
                  >
                    {result.place_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-white p-3 shadow">
            <p className="text-sm font-semibold">Lead Score</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span>Hot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Strong</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Good</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gray-500" />
                <span>Fair</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-black" />
                <span>Weak</span>
              </div>
            </div>
          </div>

          <div ref={mapContainer} className="min-h-[60vh]" />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border p-5">
            <h2 className="text-xl font-semibold">Map Lead Capture</h2>
            <p className="mt-2 text-sm text-gray-600">
              Search an address or click the map to save a lead.
            </p>

            <form onSubmit={handleSaveLead} className="mt-6 space-y-4">
              <input
                className="w-full rounded-xl border p-3"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input
                className="w-full rounded-xl border p-3"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                className="w-full rounded-xl border p-3"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />

              <input
                className="w-full rounded-xl border p-3"
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />

              <select
                className="w-full rounded-xl border p-3"
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
                className="w-full rounded-xl border p-3"
                rows={4}
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {selectedPoint && (
                <div className="rounded-xl border bg-gray-50 p-3 text-sm">
                  <p className="font-medium">Selected Property</p>
                  <p className="mt-1">{address || 'No address found yet'}</p>
                  <p className="text-gray-600">
                    {city || 'Unknown city'}, {state || 'Unknown state'} {zipCode || ''}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Pin: {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={clearSelection}
                className="w-full rounded-xl border p-3"
              >
                Clear Selection
              </button>

              <button
                type="submit"
                className="w-full rounded-xl bg-black p-3 text-white"
              >
                Save Lead from Map
              </button>

              {message && <p className="text-sm text-red-600">{message}</p>}
            </form>
          </div>

          <div className="rounded-2xl border p-5">
            <label className="mb-2 block text-sm font-medium">Filter Map Leads</label>
            <select
              className="w-full rounded-xl border p-3"
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

          <div className="rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved Leads</h2>
              <span className="text-sm text-gray-500">{filteredLeads.length} shown</span>
            </div>

            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {filteredLeads.length === 0 && (
                <p className="text-sm text-gray-600">No saved leads yet.</p>
              )}

              {filteredLeads.map((lead) => (
                <div key={lead.id} className="rounded-xl border p-3">
                  <p className="font-medium">{lead.address}</p>
                  <p className="text-sm text-gray-600">
                    {lead.city || 'Unknown city'}, {lead.state || 'Unknown state'}
                  </p>

                  <p className="mt-1 text-sm">
                    <strong>Status:</strong> {lead.status || 'New'}
                  </p>

                  <p className="mt-1 text-sm">
                    <strong>Lead Score:</strong> {lead.lead_score ?? '—'}
                  </p>

                  {lead.lead_rating && (
                    <div className="mt-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          lead.lead_rating === 'Hot'
                            ? 'bg-red-600'
                            : lead.lead_rating === 'Strong'
                            ? 'bg-orange-500'
                            : lead.lead_rating === 'Good'
                            ? 'bg-blue-600'
                            : lead.lead_rating === 'Fair'
                            ? 'bg-gray-600'
                            : 'bg-black'
                        }`}
                      >
                        {lead.lead_rating}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => focusLead(lead)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      View on Map
                    </button>

                    <a
                      href={`/dashboard/${lead.id}`}
                      className="rounded-lg bg-black px-3 py-2 text-sm text-white"
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