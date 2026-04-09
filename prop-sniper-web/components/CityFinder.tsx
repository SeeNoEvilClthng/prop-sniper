'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

function badgeClass(label: string) {
  if (label === 'Hot Lead') return 'bg-red-100 text-red-700'
  if (label === 'Strong Lead') return 'bg-orange-100 text-orange-700'
  if (label === 'Good Lead') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

function signal(text: string, color: string) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {text}
    </span>
  )
}

export default function CityFinder() {
  const supabase = createClient()
  const router = useRouter()

  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [limit, setLimit] = useState(25)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<FinderResult[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setResults([])

    try {
      const res = await fetch('/api/finder/city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state, limit }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Search failed.')
        setLoading(false)
        return
      }

      setResults(data.results || [])
      if (!data.results?.length) {
        setMessage('No properties found.')
      }
    } catch {
      setMessage('Something went wrong.')
    }

    setLoading(false)
  }

  async function handleSave(result: FinderResult) {
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

    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      address: result.address,
      city: result.city,
      state: result.state,
      status: 'New',
      notes: `Imported from City Deal Finder. Score: ${result.score}/100 (${result.label}). Reasons: ${result.reasons.join(', ')}`,
      latitude: result.latitude,
      longitude: result.longitude,
      motivation_score: result.score,
      motivation_label: result.label,
      motivation_reasons: result.reasons.join(', '),
      owner_occupied: result.ownerOccupied,
      is_absentee_owner: result.isAbsenteeOwner,
      years_owned: result.yearsOwned,
      long_term_owner: result.longTermOwner,
      senior_owner_likely: result.seniorOwnerLikely,
      property_age: result.propertyAge,
      owner_type: result.ownerType,
      likely_distressed: result.likelyDistressed,
      preforeclosure: result.preforeclosure,
      last_sale_date: result.lastSaleDate,
    })

    setSavingId(null)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Lead saved.')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-4"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">City</label>
          <input
            className="w-full rounded-xl border p-3"
            placeholder="Phoenix"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">State</label>
          <input
            className="w-full rounded-xl border p-3"
            placeholder="AZ"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            maxLength={2}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">How many</label>
          <select
            className="w-full rounded-xl border p-3"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-xl bg-black p-3 text-white"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Find Leads'}
          </button>
        </div>
      </form>

      {message && (
        <div className="rounded-xl border bg-white p-4 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4">
        {results.map((result) => (
          <div key={result.id} className="rounded-2xl border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{result.address}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {result.city}, {result.state}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(result.label)}`}
                >
                  {result.label}
                </span>
                <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                  Score {result.score}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
              <div><span className="text-gray-500">Beds:</span> {result.bedrooms ?? '—'}</div>
              <div><span className="text-gray-500">Baths:</span> {result.bathrooms ?? '—'}</div>
              <div><span className="text-gray-500">Sq Ft:</span> {result.squareFootage ?? '—'}</div>
              <div><span className="text-gray-500">Year:</span> {result.yearBuilt ?? '—'}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {result.isAbsenteeOwner && signal('Absentee Owner', 'bg-blue-100 text-blue-700')}
              {result.ownerOccupied === true && signal('Owner Occupied', 'bg-green-100 text-green-700')}
              {result.longTermOwner && signal('Long-Term Owner', 'bg-gray-100 text-gray-700')}
              {result.seniorOwnerLikely && signal('Senior Owner Likely', 'bg-orange-100 text-orange-700')}
              {result.likelyDistressed && signal('Possible Distress', 'bg-red-100 text-red-700')}
              {result.preforeclosure && signal('Preforeclosure', 'bg-red-200 text-red-800')}
              {(result.propertyAge || 0) >= 40 && signal('Older Property', 'bg-purple-100 text-purple-700')}
            </div>

            <div className="mt-4 rounded-xl border bg-gray-50 p-4">
              <p className="text-sm font-semibold">Why this may be a motivated seller lead</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {result.reasons.map((reason, index) => (
                  <li key={`${result.id}-${index}`}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => handleSave(result)}
                disabled={savingId === result.id}
                className="rounded-xl bg-black px-4 py-2 text-white"
              >
                {savingId === result.id ? 'Saving...' : 'Save as Lead'}
              </button>

              <a href="/map" className="rounded-xl border px-4 py-2">
                Open Map
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}