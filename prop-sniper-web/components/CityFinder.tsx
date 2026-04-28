'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
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

type SortMode = 'score' | 'distress' | 'newest-owner' | 'property-age'

function badgeClass(label: string) {
  if (label === 'Hot Lead') return 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
  if (label === 'Strong Lead') return 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30'
  if (label === 'Good Lead') return 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
  return 'bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30'
}

function signal(text: string, color: string) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {text}
    </span>
  )
}

function formatYears(value: number | null) {
  return value != null ? `${value} yrs` : '—'
}

function getDistressCount(result: FinderResult) {
  let total = 0
  if (result.isAbsenteeOwner) total += 1
  if (result.longTermOwner) total += 1
  if (result.seniorOwnerLikely) total += 1
  if (result.likelyDistressed) total += 1
  if (result.preforeclosure) total += 1
  if ((result.propertyAge || 0) >= 40) total += 1
  return total
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: string
  subtext: string
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtext}</p>
    </div>
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
  const [savedLeadId, setSavedLeadId] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('score')
  const [onlyDistressed, setOnlyDistressed] = useState(false)
  const [onlyAbsentee, setOnlyAbsentee] = useState(false)

  const visibleResults = useMemo(() => {
    const filtered = results.filter((result) => {
      if (onlyDistressed && !result.likelyDistressed && !result.preforeclosure) {
        return false
      }

      if (onlyAbsentee && !result.isAbsenteeOwner) {
        return false
      }

      return true
    })

    return filtered.sort((a, b) => {
      if (sortMode === 'distress') {
        return getDistressCount(b) - getDistressCount(a) || b.score - a.score
      }

      if (sortMode === 'newest-owner') {
        return (b.yearsOwned ?? 0) - (a.yearsOwned ?? 0) || b.score - a.score
      }

      if (sortMode === 'property-age') {
        return (b.propertyAge ?? 0) - (a.propertyAge ?? 0) || b.score - a.score
      }

      return b.score - a.score
    })
  }, [onlyAbsentee, onlyDistressed, results, sortMode])

  const hotCount = visibleResults.filter((result) => result.score >= 85).length
  const distressCount = visibleResults.filter(
    (result) => result.likelyDistressed || result.preforeclosure
  ).length
  const absenteeCount = visibleResults.filter((result) => result.isAbsenteeOwner).length
  const averageScore =
    visibleResults.length > 0
      ? Math.round(
          visibleResults.reduce((sum, result) => sum + result.score, 0) /
            visibleResults.length
        )
      : 0

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setResults([])
    setSavedLeadId(null)

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
    setSavedLeadId(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please log in first.')
      setSavingId(null)
      return
    }

    const { data: insertedLead, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        address: result.address,
        city: result.city,
        state: result.state,
        status: 'New',
        notes: `Imported from City Deal Finder. Score: ${result.score}/100 (${result.label}). Reasons: ${result.reasons.join(', ')}`,
        latitude: result.latitude,
        longitude: result.longitude,

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

        lead_score: result.score,
        lead_rating: result.label,
        lead_signals: result.reasons.join(', '),
      })
      .select('id')
      .single()

    setSavingId(null)

    if (error || !insertedLead) {
      setMessage(error?.message || 'Could not save lead.')
      return
    }

    setSavedLeadId(insertedLead.id)
    setMessage('Lead saved to your acquisitions queue.')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#c4b5fd]">
              Sourcing Engine
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">City Deal Finder</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Search a market, rank likely motivated sellers, and push the best
              opportunities directly into your acquisitions queue.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#c4b5fd]">Search Stack</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Market Search</h3>
            <form
              onSubmit={handleSearch}
              className="mt-5 grid gap-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">City</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/40"
                  placeholder="Phoenix"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">State</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/40"
                  placeholder="AZ"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">How many</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-violet-400/40"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-[linear-gradient(135deg,#9333ea,#6d28d9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Find Leads'}
              </button>
            </form>

            {message && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d1727] p-4 text-sm text-slate-200">
                {message}
                {savedLeadId ? (
                  <span className="ml-2">
                    <Link
                      href={`/dashboard/${savedLeadId}`}
                      className="font-semibold text-violet-200 underline"
                    >
                      Open workspace
                    </Link>
                  </span>
                ) : null}
              </div>
            )}
          </section>

          <div className="grid gap-4">
            <StatCard
              label="Visible Results"
              value={String(visibleResults.length)}
              subtext="Current sourcing set"
            />
            <StatCard
              label="Hot Leads"
              value={String(hotCount)}
              subtext="Highest-ranked opportunities"
            />
            <StatCard
              label="Distress Signals"
              value={String(distressCount)}
              subtext="Likely motivated seller candidates"
            />
            <StatCard
              label="Average Score"
              value={visibleResults.length ? String(averageScore) : '—'}
              subtext={`Absentee owner count: ${absenteeCount}`}
            />
          </div>

          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#c4b5fd]">Result Controls</p>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Sort by</label>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-violet-400/40"
                >
                  <option value="score">Highest score</option>
                  <option value="distress">Most distress</option>
                  <option value="newest-owner">Longest ownership</option>
                  <option value="property-age">Oldest property</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={onlyDistressed}
                  onChange={(e) => setOnlyDistressed(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                Distress only
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={onlyAbsentee}
                  onChange={(e) => setOnlyAbsentee(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                Absentee only
              </label>
            </div>
          </section>
        </aside>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-5 py-4 shadow-[0_20px_46px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#c4b5fd]">Working Set</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Finder Results</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {visibleResults.length} visible
                </span>
                <span className="rounded-full border border-rose-400/18 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
                  {distressCount} distressed
                </span>
                <span className="rounded-full border border-amber-400/18 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  {hotCount} hot
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
        {visibleResults.map((result) => (
          <div
            key={result.id}
            className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">{result.address}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(result.label)}`}
                  >
                    {result.label}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                    Score {result.score}
                  </span>
                </div>

                <p className="mt-2 text-slate-300">
                  {result.city}, {result.state}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Beds / Baths</p>
                    <p className="mt-2 font-medium text-white">
                      {result.bedrooms ?? '—'} / {result.bathrooms ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sq Ft</p>
                    <p className="mt-2 font-medium text-white">
                      {result.squareFootage?.toLocaleString() || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Year Built</p>
                    <p className="mt-2 font-medium text-white">
                      {result.yearBuilt ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Years Owned</p>
                    <p className="mt-2 font-medium text-white">{formatYears(result.yearsOwned)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Property Age</p>
                    <p className="mt-2 font-medium text-white">{formatYears(result.propertyAge)}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {result.isAbsenteeOwner &&
                    signal('Absentee Owner', 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30')}
                  {result.ownerOccupied === true &&
                    signal('Owner Occupied', 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30')}
                  {result.longTermOwner &&
                    signal('Long-Term Owner', 'bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30')}
                  {result.seniorOwnerLikely &&
                    signal('Senior Owner Likely', 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30')}
                  {result.likelyDistressed &&
                    signal('Possible Distress', 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30')}
                  {result.preforeclosure &&
                    signal('Preforeclosure', 'bg-red-200 text-red-800')}
                  {(result.propertyAge || 0) >= 40 &&
                    signal('Older Property', 'bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30')}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0c1522,#0a1320)] p-4">
                  <p className="text-sm font-semibold text-white">
                    Why this may be a motivated seller lead
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                    {result.reasons.map((reason, index) => (
                      <li key={`${result.id}-${index}`}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="min-w-full xl:min-w-[260px]">
                <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,#0c1522,#0a1320)] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Next Action
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {result.score >= 85
                      ? 'High-priority lead. Save this one quickly and move it into outreach or underwriting.'
                      : result.likelyDistressed || result.preforeclosure
                      ? 'Strong distress profile. Worth saving if this market fits your buying criteria.'
                      : 'Promising candidate. Save it if you want it tracked inside the acquisitions queue.'}
                  </p>

                  <div className="mt-5 grid gap-3">
                    <button
                      onClick={() => handleSave(result)}
                      disabled={savingId === result.id}
                      className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
                    >
                      {savingId === result.id ? 'Saving...' : 'Save as Lead'}
                    </button>

                    <Link
                      href="/map"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Open Map
                    </Link>

                    <Link
                      href="/leads"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Open Queue
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && visibleResults.length === 0 && results.length > 0 ? (
          <div className="rounded-[30px] border border-dashed border-white/10 bg-[#0d1727] p-10 text-center text-slate-400">
            No finder results match the active controls.
          </div>
        ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
