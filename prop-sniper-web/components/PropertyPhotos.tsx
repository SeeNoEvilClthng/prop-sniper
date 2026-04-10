'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  address: string
  city?: string | null
  state?: string | null
  zipCode?: string | null
}

type PhotoResponse = {
  fullAddress: string
  photos: string[]
  sources: {
    sale: number
    rental: number
  }
}

export default function PropertyPhotos({ address, city, state, zipCode }: Props) {
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<string[]>([])
  const [error, setError] = useState('')

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set('address', address)
    if (city) params.set('city', city)
    if (state) params.set('state', state)
    if (zipCode) params.set('zipCode', zipCode)
    return params.toString()
  }, [address, city, state, zipCode])

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(`/api/property-photos?${query}`, {
          method: 'GET',
          cache: 'no-store',
        })

        const data = (await res.json()) as PhotoResponse | { error: string }

        if (!res.ok) {
          if (!cancelled) {
            setError('Could not load property photos.')
            setPhotos([])
          }
          return
        }

        if (!cancelled) {
          setPhotos((data as PhotoResponse).photos || [])
        }
      } catch {
        if (!cancelled) {
          setError('Could not load property photos.')
          setPhotos([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (address) run()

    return () => {
      cancelled = true
    }
  }, [query, address])

  return (
    <div className="rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-semibold">Property Photos</h2>
      <p className="mt-2 text-sm text-gray-600">
        Listing photos will show here when available.
      </p>

      {loading && (
        <div className="mt-5 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
          Loading photos...
        </div>
      )}

      {!loading && error && (
        <div className="mt-5 rounded-xl border bg-gray-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && photos.length === 0 && (
        <div className="mt-5 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
          No property photos available.
        </div>
      )}

      {!loading && photos.length > 0 && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {photos.slice(0, 6).map((photo, index) => (
            <div key={`${photo}-${index}`} className="overflow-hidden rounded-xl border bg-gray-100">
              <img
                src={photo}
                alt={`Property photo ${index + 1}`}
                className="h-64 w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}