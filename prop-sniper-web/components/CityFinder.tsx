'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import LeadQuickViewDrawer from '@/components/ui/LeadQuickViewDrawer'
import ActionButton from '@/components/ui/ActionButton'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import StatCard from '@/components/ui/StatCard'
import { enrichLeadFromAddress } from '@/lib/enrich-lead'

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

type SortMode = 'score' | 'distress' | 'owner-time'

function getDistressCount(result: FinderResult) {
  let total = 0
  if (result.isAbsenteeOwner) total += 1
  if (result.longTermOwner) total += 1
  if (result.seniorOwnerLikely) total += 1
  if (result.likelyDistressed) total += 1
  if (result.preforeclosure) total += 1
  return total
}

function extractZipCode(value?: string | null) {
  const match = (value || '').match(/\b\d{5}(?:-\d{4})?\b/)
  return match?.[0] || null
}

function getNextAction(result: FinderResult) {
  if (result.preforeclosure || result.likelyDistressed) return 'Save and move into outreach.'
  if (result.score >= 80) return 'Quick view, then save this lead.'
  return 'Review details before saving.'
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
  const [selectedResult, setSelectedResult] = useState<FinderResult | null>(null)

  const visibleResults = useMemo(() => {
    const filtered = results.filter((result) => {
      if (onlyDistressed && !result.likelyDistressed && !result.preforeclosure) {
        return false
      }

      return true
    })

    return filtered.sort((a, b) => {
      if (sortMode === 'distress') {
        return getDistressCount(b) - getDistressCount(a) || b.score - a.score
      }

      if (sortMode === 'owner-time') {
        return (b.yearsOwned || 0) - (a.yearsOwned || 0) || b.score - a.score
      }

      return b.score - a.score
    })
  }, [onlyDistressed, results, sortMode])

  const hotCount = visibleResults.filter((result) => result.score >= 80).length
  const distressCount = visibleResults.filter((result) => result.preforeclosure || result.likelyDistressed).length
  const averageScore = visibleResults.length
    ? Math.round(visibleResults.reduce((sum, result) => sum + result.score, 0) / visibleResults.length)
    : 0

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setSavedLeadId(null)
    setSelectedResult(null)

    try {
      const response = await fetch('/api/finder/city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state, limit }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Search failed.')
        return
      }

      setResults(data.results || [])
      if (!data.results?.length) {
        setMessage('No properties found in that market.')
      }
    } catch {
      setMessage('Something went wrong while pulling data.')
    } finally {
      setLoading(false)
    }
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

    const enriched = await enrichLeadFromAddress(
      `${result.address}, ${result.city}, ${result.state}`.trim()
    )

    const resolvedZip = extractZipCode(result.address)

    const { data: insertedLead, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        address: result.address,
        property_address: result.address,
        city: result.city,
        state: result.state,
        zip: resolvedZip,
        zip_code: resolvedZip,
        phone: enriched.owner_phone,
        email: enriched.owner_email,
        source: 'finder',
        status: 'new_lead',
        notes: `Imported from Finder. Score: ${result.score}/100 (${result.label}). Reasons: ${result.reasons.join(', ')}`,
        latitude: result.latitude,
        longitude: result.longitude,
        owner_name: enriched.owner_name,
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
        owner_phone: enriched.owner_phone,
        owner_email: enriched.owner_email,
        lead_score: result.score,
        total_score: result.score,
        lead_rating: result.label,
        lead_signals: result.reasons.join(', '),
        ai_summary: result.reasons.join(', '),
        ai_analysis: result.reasons.join(', '),
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
      message: `CRM lead created from Finder. Grade: ${result.score}/100.`,
      status: 'logged',
    })

    setSavedLeadId(insertedLead.id)
    setMessage('Lead saved to CRM.')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finder"
        title="Pull seller data fast"
        description="Start here: Search a city or zip code to find seller leads. Save the best opportunities into CRM, then move them into outreach."
        helper="Use the quick view drawer when you only need the essentials before saving."
        actions={
          <>
            <ActionButton href="/map" variant="secondary">
              Open Map
            </ActionButton>
            <ActionButton href="/leads?view=table" variant="primary">
              View Saved Leads
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Results" value={String(visibleResults.length)} detail="Properties currently visible in your working set." />
        <StatCard label="Hot Matches" value={String(hotCount)} detail="High-score properties worth a closer look." />
        <StatCard label="Distress Signals" value={String(distressCount)} detail="Properties showing pre-foreclosure or stronger distress." />
      </section>

      <section className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
        <form className="grid gap-3 xl:grid-cols-[1fr_180px_120px_auto]" onSubmit={handleSearch}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
              City
            </label>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Phoenix"
              className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
              State
            </label>
            <input
              value={state}
              onChange={(event) => setState(event.target.value)}
              placeholder="AZ"
              className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
              Limit
            </label>
            <select
              value={String(limit)}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="flex items-end">
            <ActionButton type="submit" variant="primary" className="w-full">
              {loading ? 'Searching...' : 'Pull Leads'}
            </ActionButton>
          </div>
        </form>

        <details className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <summary className="cursor-pointer text-sm font-medium text-white">
            Filters and sorting
          </summary>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="rounded-xl border border-white/8 bg-[#080b12] px-4 py-3 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Sort</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="mt-2 w-full bg-transparent text-white outline-none"
              >
                <option value="score">Highest score</option>
                <option value="distress">Most distress</option>
                <option value="owner-time">Longest owned</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#080b12] px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={onlyDistressed}
                onChange={(event) => setOnlyDistressed(event.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-transparent"
              />
              Distress only
            </label>

            <div className="rounded-xl border border-white/8 bg-[#080b12] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Average Score</p>
              <p className="mt-2 text-sm font-semibold text-white">{averageScore || '—'}</p>
            </div>
          </div>
        </details>

        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </section>

      {visibleResults.length === 0 ? (
        <EmptyState
          title="No finder results yet"
          description="Search a market to pull properties and start building your lead list."
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b0f17]">
          <div className="hidden grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr_0.9fr_1fr] gap-4 border-b border-white/8 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500 lg:grid">
            <span>Property</span>
            <span>Owner</span>
            <span>Signals</span>
            <span>Score</span>
            <span>Next Action</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-white/8">
            {visibleResults.map((result) => (
              <div key={result.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr_0.9fr_1fr] lg:items-center">
                <div>
                  <p className="text-sm font-medium text-white">{result.address}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {[result.city, result.state].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">{result.ownerType || 'Owner data pending'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.preforeclosure ? (
                    <StatusBadge status="qualified_hot" />
                  ) : null}
                  {result.isAbsenteeOwner ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                      Absentee
                    </span>
                  ) : null}
                  {result.likelyDistressed ? (
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/12 px-2.5 py-1 text-[11px] text-amber-200">
                      Distressed
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{result.score}</p>
                  <p className="text-xs text-slate-400">{result.label}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">{getNextAction(result)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton size="sm" variant="secondary" onClick={() => setSelectedResult(result)}>
                    Quick View
                  </ActionButton>
                  <ActionButton
                    size="sm"
                    variant="primary"
                    onClick={() => void handleSave(result)}
                    disabled={savingId === result.id}
                  >
                    {savingId === result.id ? 'Saving...' : 'Save Lead'}
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LeadQuickViewDrawer
        open={Boolean(selectedResult)}
        onClose={() => setSelectedResult(null)}
        lead={
          selectedResult
            ? {
                address: selectedResult.address,
                city: selectedResult.city,
                state: selectedResult.state,
                phone: null,
                score: selectedResult.score,
                status: selectedResult.score >= 80 ? 'qualified_hot' : 'new_lead',
                summary: selectedResult.reasons.join(', '),
              }
            : null
        }
      >
        {selectedResult ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Why this lead</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedResult.reasons.map((reason) => (
                <span key={reason} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                  {reason}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <ActionButton
                variant="primary"
                onClick={() => void handleSave(selectedResult)}
                disabled={savingId === selectedResult.id}
              >
                {savingId === selectedResult.id ? 'Saving...' : 'Save Lead'}
              </ActionButton>
              {savedLeadId ? (
                <ActionButton href={`/dashboard/${savedLeadId}`} variant="ghost" className="ml-2">
                  Open Saved Lead
                </ActionButton>
              ) : null}
            </div>
          </div>
        ) : null}
      </LeadQuickViewDrawer>
    </div>
  )
}
