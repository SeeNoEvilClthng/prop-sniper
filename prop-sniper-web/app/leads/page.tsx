import Link from 'next/link'
import { redirect } from 'next/navigation'

import QueueLeadActions from '@/components/QueueLeadActions'
import QueueLeadNoteForm from '@/components/QueueLeadNoteForm'
import QueueLeadTaskCard from '@/components/QueueLeadTaskCard'
import { parseLeadAssignmentMessage } from '@/lib/lead-assignment'
import { parseLeadTaskMessage } from '@/lib/lead-tasks'
import { createClient } from '@/lib/supabase/server'

type SearchParams = {
  search?: string
  status?: string
  rating?: string
  follow_up?: string
}

type PageProps = {
  searchParams?: Promise<SearchParams>
}

type LeadRecord = {
  id: string
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  status?: string | null
  owner_name?: string | null
  owner_phone?: string | null
  lead_score?: number | null
  lead_rating?: string | null
  lead_signals?: string | null
  estimated_value?: number | null
  estimated_rent?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  square_footage?: number | null
  target_offer?: number | null
  estimated_repairs?: number | null
  follow_up_date?: string | null
  ai_analysis?: string | null
  notes?: string | null
  created_at?: string | null
}

type ContactAttemptRecord = {
  id: string
  lead_id?: string | null
  method?: string | null
  message?: string | null
  status?: string | null
  created_at?: string | null
}

const statusOptions = [
  'All',
  'New',
  'Contacted',
  'Follow Up',
  'Negotiating',
  'Under Contract',
  'Dead',
]

const ratingOptions = ['All', 'Hot', 'Strong', 'Good', 'Fair', 'Weak']

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(Number(value))) return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString()
}

function isFollowUpDue(value?: string | null) {
  if (!value) return false

  const followUp = new Date(value)
  if (Number.isNaN(followUp.getTime())) return false

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(
    followUp.getFullYear(),
    followUp.getMonth(),
    followUp.getDate()
  )

  return dueDate <= today
}

function getSignals(value?: string | null) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function getStatusClasses(status?: string | null) {
  switch (status) {
    case 'New':
      return 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
    case 'Contacted':
      return 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30'
    case 'Follow Up':
      return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30'
    case 'Negotiating':
      return 'bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30'
    case 'Under Contract':
      return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
    case 'Dead':
      return 'bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30'
    default:
      return 'bg-white/10 text-slate-200 ring-1 ring-white/10'
  }
}

function getRatingClasses(rating?: string | null) {
  switch (rating) {
    case 'Hot':
      return 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
    case 'Strong':
      return 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30'
    case 'Good':
      return 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
    case 'Fair':
      return 'bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30'
    case 'Weak':
      return 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30'
    default:
      return 'bg-white/10 text-slate-200 ring-1 ring-white/10'
  }
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
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{subtext}</p>
    </div>
  )
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allLeadRows = (data || []) as LeadRecord[]
  const leadIds = allLeadRows.map((lead) => lead.id)

  let contactAttempts: ContactAttemptRecord[] = []

  if (leadIds.length > 0) {
    const { data: attempts } = await supabase
      .from('contact_attempts')
      .select('id, lead_id, method, message, status, created_at')
      .in('lead_id', leadIds)
      .order('created_at', { ascending: false })

    contactAttempts = (attempts || []) as ContactAttemptRecord[]
  }

  const taskMap = new Map(
    allLeadRows.map((lead) => {
      const tasks = contactAttempts
        .filter((attempt) => attempt.lead_id === lead.id && attempt.method === 'task')
        .map((attempt) => {
          const parsed = parseLeadTaskMessage(attempt.message)

          return {
            id: String(attempt.id),
            title: parsed.title,
            dueDate: parsed.dueDate,
            details: parsed.details,
            status: attempt.status || 'open',
          }
        })

      return [lead.id, tasks]
    })
  )
  const assignmentMap = new Map(
    allLeadRows.map((lead) => {
      const latestAssignment = contactAttempts.find(
        (attempt) => attempt.lead_id === lead.id && attempt.method === 'assignment'
      )

      return [
        lead.id,
        latestAssignment ? parseLeadAssignmentMessage(latestAssignment.message) : null,
      ]
    })
  )

  const search = (params.search || '').trim().toLowerCase()
  const status = params.status || 'All'
  const rating = params.rating || 'All'
  const followUpFilter = params.follow_up || 'All'

  const leads = allLeadRows
    .filter((lead) => {
      const haystack = [
        lead.address,
        lead.city,
        lead.state,
        lead.owner_name,
        lead.status,
        lead.lead_rating,
        lead.lead_signals,
        lead.zip_code,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = !search || haystack.includes(search)
      const matchesStatus = status === 'All' || (lead.status || 'New') === status
      const matchesRating =
        rating === 'All' || (lead.lead_rating || 'Weak') === rating
      const due = isFollowUpDue(lead.follow_up_date)
      const matchesFollowUp =
        followUpFilter === 'All' ||
        (followUpFilter === 'Due' && due) ||
        (followUpFilter === 'Upcoming' && !due && !!lead.follow_up_date) ||
        (followUpFilter === 'Unscheduled' && !lead.follow_up_date)

      return matchesSearch && matchesStatus && matchesRating && matchesFollowUp
    })
    .sort((a, b) => {
      const aDue = isFollowUpDue(a.follow_up_date) ? 1 : 0
      const bDue = isFollowUpDue(b.follow_up_date) ? 1 : 0
      if (aDue !== bDue) return bDue - aDue

      const aScore = a.lead_score ?? 0
      const bScore = b.lead_score ?? 0
      if (aScore !== bScore) return bScore - aScore

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0
      return bCreated - aCreated
    })

  const totalLeads = leads.length
  const hotLeads = leads.filter((lead) => (lead.lead_score ?? 0) >= 80).length
  const followUpsDue = leads.filter((lead) => isFollowUpDue(lead.follow_up_date)).length
  const underContract = leads.filter(
    (lead) => (lead.status || 'New') === 'Under Contract'
  ).length

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_22%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
                Acquisition Queue
              </p>
              <h1 className="mt-2 text-3xl font-bold">Lead Pipeline</h1>
              <p className="mt-2 max-w-3xl text-slate-300">
                Work the highest-priority opportunities first, stay on top of follow-up,
                and move from sourced lead to active deal faster.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/new"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Add Lead
              </Link>
              <Link
                href="/finder"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open Finder
              </Link>
              <Link
                href="/map"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Map Leads
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Visible Leads"
            value={String(totalLeads)}
            subtext="Current queue after filters"
          />
          <StatCard
            label="Hot Opportunities"
            value={String(hotLeads)}
            subtext="Scored 80+ and worth working now"
          />
          <StatCard
            label="Follow Ups Due"
            value={String(followUpsDue)}
            subtext="Leads that need immediate attention"
          />
          <StatCard
            label="Under Contract"
            value={String(underContract)}
            subtext="Deals actively moving toward close"
          />
        </section>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Queue Filters</h2>
              <p className="mt-2 text-slate-300">
                Narrow the pipeline by urgency, motivation, and lead quality.
              </p>
            </div>
          </div>

          <form className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Search
              </label>
              <input
                name="search"
                defaultValue={params.search || ''}
                placeholder="Address, city, owner, signal, ZIP..."
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Status
              </label>
              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Rating
              </label>
              <select
                name="rating"
                defaultValue={rating}
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
              >
                {ratingOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Follow Up
              </label>
              <select
                name="follow_up"
                defaultValue={followUpFilter}
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
              >
                <option>All</option>
                <option>Due</option>
                <option>Upcoming</option>
                <option>Unscheduled</option>
              </select>
            </div>

            <div className="flex gap-3 lg:justify-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white lg:w-auto"
              >
                Apply
              </button>
              <Link
                href="/leads"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 lg:w-auto"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        <section className="mt-6 space-y-4">
          {leads.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-white/10 bg-[#0d1727] p-10 text-center text-slate-400">
              No leads match the current filters.
            </div>
          ) : (
            leads.map((lead) => {
              const signals = getSignals(lead.lead_signals)
              const due = isFollowUpDue(lead.follow_up_date)
              const leadTasks = taskMap.get(lead.id) || []
              const assignment = assignmentMap.get(lead.id)

              return (
                <article
                  key={lead.id}
                  className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-white">
                          {lead.address || 'No address'}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            lead.status
                          )}`}
                        >
                          {lead.status || 'New'}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getRatingClasses(
                            lead.lead_rating
                          )}`}
                        >
                          {lead.lead_rating || 'Weak'}
                        </span>
                        {due ? (
                          <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30">
                            Follow Up Due
                          </span>
                        ) : null}
                        {assignment ? (
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                            Owner {assignment.assigneeEmail}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-slate-300">
                        {[lead.city, lead.state, lead.zip_code].filter(Boolean).join(', ') ||
                          'No location'}
                      </p>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Owner
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {lead.owner_name || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Score
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {lead.lead_score ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Est. Value
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {formatMoney(lead.estimated_value)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Target Offer
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {formatMoney(lead.target_offer)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Next Follow Up
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {formatDate(lead.follow_up_date)}
                          </p>
                        </div>
                      </div>

                      {signals.length > 0 ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {signals.map((signal) => (
                            <span
                              key={signal}
                              className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-200 ring-1 ring-sky-400/30"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-300">
                        {lead.ai_analysis ||
                          lead.notes ||
                          'No analysis saved yet. Open the workspace to review motivation, underwriting, and outreach history.'}
                      </p>
                    </div>

                    <div className="min-w-full xl:min-w-[260px]">
                      <div className="rounded-3xl border border-white/10 bg-[#0d1727] p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Quick Actions
                        </p>

                        <div className="mt-4 grid gap-3">
                          <Link
                            href={`/dashboard/${lead.id}`}
                            className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
                          >
                            Open Workspace
                          </Link>
                          <Link
                            href={`/dashboard/${lead.id}/edit`}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                          >
                            Edit Lead
                          </Link>
                          <Link
                            href="/map"
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                          >
                            Open Map
                          </Link>
                        </div>

                        <QueueLeadActions
                          leadId={lead.id}
                          currentStatus={lead.status}
                          currentFollowUpDate={lead.follow_up_date}
                        />

                        <QueueLeadTaskCard leadId={lead.id} tasks={leadTasks} />

                        <QueueLeadNoteForm leadId={lead.id} />

                        <div className="mt-5 grid gap-3 text-sm text-slate-300">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Repairs
                            </p>
                            <p className="mt-1">{formatMoney(lead.estimated_repairs)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Rent Estimate
                            </p>
                            <p className="mt-1">{formatMoney(lead.estimated_rent)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Seller Phone
                            </p>
                            <p className="mt-1">{lead.owner_phone || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}
