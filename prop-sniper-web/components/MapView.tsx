'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
}

function getMarkerColor(status: string | null) {
  if (status === 'Under Contract') return 'green'
  if (status === 'Negotiating') return 'orange'
  if (status === 'Contacted') return 'blue'
  if (status === 'Dead') return 'gray'
  return 'red'
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
            <strong>Status:</strong> ${lead.status || 'New'}
          </p>
          <a href="/dashboard/${lead.id}" style="color:#2563eb; font-size:13px;">
            Open Lead
          </a>
        </div>
      `)

      const marker = new mapboxgl.Marker({
        color: getMarkerColor(lead.status),
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
      .select('id, address, city, state, status, notes, latitude, longitude')
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

      setAddress(props.full_address || props.name || '')
      setCity(context.place?.name || '')
      setState(context.region?.name || '')
    } catch {
      setAddress('')
      setCity('')
      setState('')
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

    const context = result.properties?.context || {}

    setAddress(result.properties?.full_address || result.place_name || '')
    setCity(context.place?.name || '')
    setState(context.region?.name || '')

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
          <strong>Status:</strong> ${lead.status || 'New'}
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

    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      address,
      city,
      state,
      status,
      notes,
      latitude: selectedPoint.lat,
      longitude: selectedPoint.lng,
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
            <p className="text-sm font-semibold">Lead Status</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span>New</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Contacted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Negotiating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span>Under Contract</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gray-500" />
                <span>Dead</span>
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
                    {city || 'Unknown city'}, {state || 'Unknown state'}
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