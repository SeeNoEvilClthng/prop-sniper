import Link from 'next/link'
import { redirect } from 'next/navigation'

import { navGroups } from './dashboardData'
import { parseLeadAssignmentMessage } from '@/lib/lead-assignment'
import { parseLeadTaskMessage } from '@/lib/lead-tasks'
import { createClient } from '@/lib/supabase/server'

type LeadRecord = {
  id: string
  address?: string | null
  city?: string | null
  state?: string | null
  status?: string | null
  owner_name?: string | null
  lead_score?: number | null
  lead_rating?: string | null
  lead_signals?: string | null
  follow_up_date?: string | null
  estimated_value?: number | null
  target_offer?: number | null
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

const pipelineStages = [
  'New',
  'Contacted',
  'Follow Up',
  'Negotiating',
  'Under Contract',
  'Dead',
] as const

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

function formatDateTime(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isDueTodayOrEarlier(value?: string | null) {
  if (!value) return false

  const input = new Date(value)
  if (Number.isNaN(input.getTime())) return false

  const today = new Date()
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const due = new Date(input.getFullYear(), input.getMonth(), input.getDate())

  return due <= current
}

function isOpenTaskOverdue(dueDate?: string | null, status?: string | null) {
  if (status === 'completed') return false
  return isDueTodayOrEarlier(dueDate)
}

function getMethodLabel(method?: string | null, status?: string | null) {
  switch (method) {
    case 'note':
      return 'Manual note added'
    case 'workflow':
      return 'Workflow updated'
    case 'sms':
      return 'Text outreach logged'
    case 'email':
      return 'Email outreach logged'
    case 'call':
      return 'Call activity logged'
    default:
      return `${method?.toUpperCase() || 'CRM'} ${status || 'activity'}`
    }
}

function getMethodClasses(method?: string | null) {
  switch (method) {
    case 'note':
      return 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
    case 'workflow':
      return 'bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30'
    case 'sms':
      return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
    case 'email':
      return 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30'
    case 'call':
      return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30'
    default:
      return 'bg-white/10 text-slate-200 ring-1 ring-white/10'
  }
}

function getSignals(value?: string | null) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
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
    default:
      return 'bg-white/10 text-slate-200 ring-1 ring-white/10'
  }
}

function getPercent(value: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

function formatOwnerLabel(email?: string | null) {
  if (!email) return 'Unassigned'

  const [name] = email.split('@')
  if (!name) return email

  return name
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-slate-300">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: leads }, { count: investorCount }] = await Promise.all([
    supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${user.id},is_public.eq.true`),
  ])

  const allLeads = (leads || []) as LeadRecord[]
  const leadIds = allLeads.map((lead) => lead.id)
  const leadMap = new Map(allLeads.map((lead) => [lead.id, lead]))

  let recentAttempts: ContactAttemptRecord[] = []
  let workflowAttempts: ContactAttemptRecord[] = []
  let contactAttemptCount = 0

  if (leadIds.length > 0) {
    const [{ data: attempts }, { count }, { data: workflowEvents }] = await Promise.all([
      supabase
        .from('contact_attempts')
        .select('id, lead_id, method, message, status, created_at')
        .in('lead_id', leadIds)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('contact_attempts')
        .select('id', { count: 'exact', head: true })
        .in('lead_id', leadIds),
      supabase
        .from('contact_attempts')
        .select('id, lead_id, method, message, status, created_at')
        .in('lead_id', leadIds)
        .in('method', ['assignment', 'task'])
        .order('created_at', { ascending: false }),
    ])

    recentAttempts = (attempts || []) as ContactAttemptRecord[]
    workflowAttempts = (workflowEvents || []) as ContactAttemptRecord[]
    contactAttemptCount = count || 0
  }

  const followUpsDue = allLeads.filter((lead) => isDueTodayOrEarlier(lead.follow_up_date))
  const scheduledFollowUps = allLeads.filter((lead) => Boolean(lead.follow_up_date))
  const hotLeads = allLeads
    .filter((lead) => (lead.lead_score ?? 0) >= 80)
    .sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
    .slice(0, 5)
  const underContract = allLeads
    .filter((lead) => (lead.status || 'New') === 'Under Contract')
    .slice(0, 5)
  const newLeads = allLeads
    .filter((lead) => (lead.status || 'New') === 'New')
    .slice(0, 5)
  const recentActivity = recentAttempts
    .map((attempt) => {
      const lead = attempt.lead_id ? leadMap.get(attempt.lead_id) : undefined

      return {
        id: attempt.id,
        leadId: attempt.lead_id || '',
        leadAddress: lead?.address || 'Unknown lead',
        market: [lead?.city, lead?.state].filter(Boolean).join(', ') || 'Market unknown',
        title: getMethodLabel(attempt.method, attempt.status),
        detail: attempt.message || 'No activity detail recorded.',
        timestamp: attempt.created_at || '',
        method: attempt.method || 'activity',
      }
    })
    .filter((item) => item.timestamp)
  const recentInternalUpdates = recentActivity.filter(
    (item) => item.method === 'note' || item.method === 'workflow'
  )
  const assignmentMap = new Map(
    allLeads.map((lead) => {
      const latestAssignment = workflowAttempts.find(
        (attempt) => attempt.lead_id === lead.id && attempt.method === 'assignment'
      )

      return [
        lead.id,
        latestAssignment
          ? parseLeadAssignmentMessage(latestAssignment.message)
          : {
              assigneeId: user.id,
              assigneeEmail: user.email || 'Current user',
              assigneeRole: 'user',
            },
      ]
    })
  )
  const openTasks = workflowAttempts
    .filter((attempt) => attempt.method === 'task')
    .map((attempt) => {
      const parsed = parseLeadTaskMessage(attempt.message)
      const lead = attempt.lead_id ? leadMap.get(attempt.lead_id) : undefined

      return {
        id: attempt.id,
        leadId: attempt.lead_id || '',
        leadAddress: lead?.address || 'Unknown lead',
        market: [lead?.city, lead?.state].filter(Boolean).join(', ') || 'Market unknown',
        assigneeId: lead?.id ? assignmentMap.get(lead.id)?.assigneeId || '' : '',
        title: parsed.title,
        dueDate: parsed.dueDate,
        details: parsed.details,
        status: attempt.status || 'open',
        createdAt: attempt.created_at || '',
      }
    })
    .filter((task) => task.status !== 'completed')
    .sort((a, b) => {
      const aOverdue = isOpenTaskOverdue(a.dueDate, a.status) ? 1 : 0
      const bOverdue = isOpenTaskOverdue(b.dueDate, b.status) ? 1 : 0

      if (aOverdue !== bOverdue) return bOverdue - aOverdue
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  const overdueTasks = openTasks.filter((task) => isOpenTaskOverdue(task.dueDate, task.status))
  const myAssignedLeads = allLeads
    .filter((lead) => {
      const assignment = assignmentMap.get(lead.id)
      return assignment?.assigneeId
        ? assignment.assigneeId === user.id
        : true
    })
    .sort((a, b) => {
      const aDue = isDueTodayOrEarlier(a.follow_up_date) ? 1 : 0
      const bDue = isDueTodayOrEarlier(b.follow_up_date) ? 1 : 0
      if (aDue !== bDue) return bDue - aDue
      return (b.lead_score ?? 0) - (a.lead_score ?? 0)
    })
  const myOpenTasks = openTasks.filter((task) => (task.assigneeId ? task.assigneeId === user.id : true))
  const myOverdueTasks = myOpenTasks.filter((task) => isOpenTaskOverdue(task.dueDate, task.status))
  const ownerMetrics = Array.from(
    assignmentMap.entries().reduce(
      (map, [leadId, assignment]) => {
        const lead = leadMap.get(leadId)
        if (!lead) return map

        const key = assignment?.assigneeId || `email:${assignment?.assigneeEmail || 'unassigned'}`
        const existing = map.get(key) || {
          ownerId: assignment?.assigneeId || '',
          ownerEmail: assignment?.assigneeEmail || 'Unassigned',
          ownerLabel: formatOwnerLabel(assignment?.assigneeEmail || 'Unassigned'),
          leadCount: 0,
          hotLeadCount: 0,
          followUpsDue: 0,
          underContractCount: 0,
          totalScore: 0,
        }

        existing.leadCount += 1
        existing.totalScore += lead.lead_score ?? 0
        if ((lead.lead_score ?? 0) >= 80) existing.hotLeadCount += 1
        if (isDueTodayOrEarlier(lead.follow_up_date)) existing.followUpsDue += 1
        if ((lead.status || 'New') === 'Under Contract') existing.underContractCount += 1

        map.set(key, existing)
        return map
      },
      new Map<
        string,
        {
          ownerId: string
          ownerEmail: string
          ownerLabel: string
          leadCount: number
          hotLeadCount: number
          followUpsDue: number
          underContractCount: number
          totalScore: number
        }
      >()
    )
  )
    .map(([key, metric]) => {
      const ownerTasks = openTasks.filter((task) =>
        metric.ownerId ? task.assigneeId === metric.ownerId : !task.assigneeId
      )
      const overdueOwnerTasks = ownerTasks.filter((task) => isOpenTaskOverdue(task.dueDate, task.status))

      return {
        key,
        ...metric,
        avgScore: metric.leadCount ? Math.round(metric.totalScore / metric.leadCount) : 0,
        openTaskCount: ownerTasks.length,
        overdueTaskCount: overdueOwnerTasks.length,
      }
    })
    .sort((a, b) => {
      if (b.overdueTaskCount !== a.overdueTaskCount) return b.overdueTaskCount - a.overdueTaskCount
      if (b.hotLeadCount !== a.hotLeadCount) return b.hotLeadCount - a.hotLeadCount
      return b.leadCount - a.leadCount
    })
  const mostLoadedOwner = ownerMetrics[0]
  const mostOverdueOwner = [...ownerMetrics].sort((a, b) => b.overdueTaskCount - a.overdueTaskCount)[0]
  const mostActiveCloser = [...ownerMetrics].sort(
    (a, b) => b.underContractCount - a.underContractCount || b.hotLeadCount - a.hotLeadCount
  )[0]
  const stageMetrics = pipelineStages.map((stage) => {
    const count = allLeads.filter((lead) => (lead.status || 'New') === stage).length

    return {
      stage,
      count,
      percent: getPercent(count, allLeads.length),
    }
  })
  const avgLeadScore = allLeads.length
    ? Math.round(
        allLeads.reduce((sum, lead) => sum + (lead.lead_score ?? 0), 0) / allLeads.length
      )
    : 0
  const activeLeadCount = allLeads.filter(
    (lead) => !['Dead', 'Under Contract'].includes(lead.status || 'New')
  ).length
  const contactCoverage = allLeads.length
    ? Math.round((recentAttempts.length / allLeads.length) * 100)
    : 0

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_22%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
                Action Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold">What Needs Attention Today</h1>
              <p className="mt-2 max-w-3xl text-slate-300">
                Run acquisitions from one place: follow up with overdue sellers,
                prioritize the hottest leads, and move active deals toward dispo.
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
                href="/leads?follow_up=Due"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open Follow Ups
              </Link>
              <Link
                href="/finder"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Source More Leads
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Leads"
            value={String(allLeads.length)}
            subtext="Current acquisition pipeline"
          />
          <StatCard
            label="Follow Ups Due"
            value={String(followUpsDue.length)}
            subtext="Needs seller attention now"
          />
          <StatCard
            label="Hot Leads"
            value={String(allLeads.filter((lead) => (lead.lead_score ?? 0) >= 80).length)}
            subtext="High-priority opportunities"
          />
          <StatCard
            label="Buyer Network"
            value={String(investorCount || 0)}
            subtext={`Open tasks: ${openTasks.length} • CRM events: ${contactAttemptCount || 0}`}
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Most Loaded Rep"
            value={mostLoadedOwner?.ownerLabel || '—'}
            subtext={
              mostLoadedOwner
                ? `${mostLoadedOwner.leadCount} leads • ${mostLoadedOwner.openTaskCount} open tasks`
                : 'No ownership data yet'
            }
          />
          <StatCard
            label="Most At Risk"
            value={mostOverdueOwner?.ownerLabel || '—'}
            subtext={
              mostOverdueOwner
                ? `${mostOverdueOwner.overdueTaskCount} overdue tasks • ${mostOverdueOwner.followUpsDue} due follow-ups`
                : 'No overdue workflow yet'
            }
          />
          <StatCard
            label="Top Closer Lane"
            value={mostActiveCloser?.ownerLabel || '—'}
            subtext={
              mostActiveCloser
                ? `${mostActiveCloser.underContractCount} under contract • ${mostActiveCloser.hotLeadCount} hot leads`
                : 'No contract activity yet'
            }
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="My Leads"
            value={String(myAssignedLeads.length)}
            subtext="Currently owned by you"
          />
          <StatCard
            label="My Open Tasks"
            value={String(myOpenTasks.length)}
            subtext="Unfinished tasks in your inbox"
          />
          <StatCard
            label="My Overdue Tasks"
            value={String(myOverdueTasks.length)}
            subtext="Tasks you should clear today"
          />
          <StatCard
            label="My Hot Leads"
            value={String(myAssignedLeads.filter((lead) => (lead.lead_score ?? 0) >= 80).length)}
            subtext="High-score leads assigned to you"
          />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard
            title="My Leads"
            description="Your owned leads, sorted so due follow-ups and stronger opportunities surface first."
          >
            {myAssignedLeads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                No leads are assigned to you yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myAssignedLeads.slice(0, 6).map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/${lead.id}`}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{lead.address}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {lead.city}, {lead.state}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                        {lead.lead_score ?? '—'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          lead.status
                        )}`}
                      >
                        {lead.status || 'New'}
                      </span>
                      {lead.follow_up_date ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isDueTodayOrEarlier(lead.follow_up_date)
                              ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
                              : 'bg-white/10 text-slate-200 ring-1 ring-white/10'
                          }`}
                        >
                          {isDueTodayOrEarlier(lead.follow_up_date) ? 'Due ' : 'Next '}
                          {formatDate(lead.follow_up_date)}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="My Tasks"
            description="Your task inbox, with overdue work pushed to the top so you can execute fast."
          >
            {myOpenTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                No open tasks are assigned to you yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myOpenTasks.slice(0, 6).map((task) => (
                  <Link
                    key={task.id}
                    href={task.leadId ? `/dashboard/${task.leadId}` : '/leads'}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{task.leadAddress}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {task.market}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isOpenTaskOverdue(task.dueDate, task.status)
                            ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
                            : 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
                        }`}
                      >
                        {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
                      </span>
                    </div>
                    {task.details ? (
                      <p className="mt-3 text-sm text-slate-300">{task.details}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Overdue Follow Ups"
            description="These leads should be touched today so momentum does not slip."
          >
            {followUpsDue.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                Nothing overdue right now. Your follow-up queue is clear.
              </div>
            ) : (
              <div className="space-y-3">
                {followUpsDue.slice(0, 6).map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/${lead.id}`}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{lead.address}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {lead.city}, {lead.state}
                        </p>
                      </div>
                      <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30">
                        Due {formatDate(lead.follow_up_date)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
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
                        {lead.lead_rating || 'Unrated'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Quick Navigation"
            description="Jump straight into the workflows that matter most this week."
          >
            <div className="grid gap-3">
              {navGroups.flatMap((group) => group.items).slice(0, 8).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="Task Queue"
            description="The most important lead tasks to knock out next, with overdue work pushed to the top."
          >
            {openTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                No open lead tasks yet. Create tasks inside a lead workspace to turn follow-up into a real checklist.
              </div>
            ) : (
              <div className="space-y-3">
                {openTasks.slice(0, 8).map((task) => (
                  <Link
                    key={task.id}
                    href={task.leadId ? `/dashboard/${task.leadId}` : '/leads'}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{task.leadAddress}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {task.market}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isOpenTaskOverdue(task.dueDate, task.status)
                            ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
                            : 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
                        }`}
                      >
                        {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
                      </span>
                    </div>
                    {task.details ? (
                      <p className="mt-3 text-sm text-slate-300">{task.details}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Task Health"
            description="A quick read on whether lead tasks are keeping pace with the rest of the pipeline."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Open Tasks</p>
                <p className="mt-2 text-2xl font-bold text-white">{openTasks.length}</p>
                <p className="mt-1 text-sm text-slate-400">Current unfinished lead tasks</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Overdue Tasks</p>
                <p className="mt-2 text-2xl font-bold text-white">{overdueTasks.length}</p>
                <p className="mt-1 text-sm text-slate-400">Tasks that should already be handled</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Task Coverage</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {getPercent(openTasks.length, allLeads.length)}
                </p>
                <p className="mt-1 text-sm text-slate-400">Open tasks relative to lead volume</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Overdue share</p>
                  <p className="text-sm font-semibold text-rose-300">
                    {overdueTasks.length} / {openTasks.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
                    style={{ width: getPercent(overdueTasks.length, openTasks.length || 1) }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  When this rises, reps are setting next steps but not clearing them fast enough.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Leads with no open task</p>
                  <p className="text-sm font-semibold text-amber-300">
                    {Math.max(allLeads.length - openTasks.length, 0)} / {allLeads.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{
                      width: getPercent(Math.max(allLeads.length - openTasks.length, 0), allLeads.length || 1),
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  This highlights how much of the pipeline still lacks a concrete next action.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Team Ownership"
            description="A manager-level view of rep load, lead quality, and who is carrying the most overdue workflow risk."
          >
            {ownerMetrics.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                No assignment activity yet. Assign leads to teammates to unlock team tracking here.
              </div>
            ) : (
              <div className="space-y-3">
                {ownerMetrics.slice(0, 6).map((owner) => (
                  <div
                    key={owner.key}
                    className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{owner.ownerLabel}</p>
                        <p className="mt-1 text-sm text-slate-400">{owner.ownerEmail}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                          {owner.leadCount} leads
                        </span>
                        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-400/30">
                          {owner.openTaskCount} open tasks
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            owner.overdueTaskCount > 0
                              ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
                              : 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
                          }`}
                        >
                          {owner.overdueTaskCount} overdue
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4 text-sm text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hot Leads</p>
                        <p className="mt-1 font-semibold text-white">{owner.hotLeadCount}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Due Follow Ups</p>
                        <p className="mt-1 font-semibold text-white">{owner.followUpsDue}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Avg Score</p>
                        <p className="mt-1 font-semibold text-white">{owner.avgScore}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Under Contract</p>
                        <p className="mt-1 font-semibold text-white">{owner.underContractCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Manager Snapshot"
            description="Use this to spot coaching needs fast: overloaded reps, stale follow-ups, and where the strongest deals are concentrated."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Team task risk</p>
                  <p className="text-sm font-semibold text-rose-300">
                    {overdueTasks.length} / {openTasks.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
                    style={{ width: getPercent(overdueTasks.length, openTasks.length || 1) }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  This shows how much team workflow is already behind, not just scheduled.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Hot leads assigned</p>
                  <p className="text-sm font-semibold text-sky-300">
                    {ownerMetrics.reduce((sum, owner) => sum + owner.hotLeadCount, 0)} / {allLeads.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                    style={{
                      width: getPercent(
                        ownerMetrics.reduce((sum, owner) => sum + owner.hotLeadCount, 0),
                        allLeads.length || 1
                      ),
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Strong lead concentration helps you decide whether your best opportunities are evenly distributed.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Owned pipeline coverage</p>
                  <p className="text-sm font-semibold text-amber-300">
                    {ownerMetrics.reduce((sum, owner) => sum + owner.leadCount, 0)} / {allLeads.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{
                      width: getPercent(
                        ownerMetrics.reduce((sum, owner) => sum + owner.leadCount, 0),
                        allLeads.length || 1
                      ),
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Every lead should have clear ownership so accountability does not disappear between follow-ups.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Recent CRM Activity"
            description="The latest seller outreach, notes, and pipeline changes across your leads."
          >
            {recentActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                No CRM activity yet. As your team logs outreach and notes, it will show up here.
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    href={item.leadId ? `/dashboard/${item.leadId}` : '/leads'}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{item.leadAddress}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {item.market}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getMethodClasses(
                          item.method
                        )}`}
                      >
                        {item.method}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{item.detail}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Recent Notes And Workflow"
            description="Internal updates your team made most recently, so nothing slips between follow-ups."
          >
            {recentInternalUpdates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                No notes or workflow changes have been logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentInternalUpdates.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={item.leadId ? `/dashboard/${item.leadId}` : '/leads'}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.leadAddress}</p>
                        <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getMethodClasses(
                          item.method
                        )}`}
                      >
                        {item.method}
                      </span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard
            title="Pipeline Analytics"
            description="See where your deals are clustering so you can spot bottlenecks and momentum."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Avg Lead Score
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{avgLeadScore}</p>
                <p className="mt-1 text-sm text-slate-400">Average deal quality in queue</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Active Leads
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{activeLeadCount}</p>
                <p className="mt-1 text-sm text-slate-400">Still being worked by acquisitions</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Under Contract Rate
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {getPercent(underContract.length, allLeads.length)}
                </p>
                <p className="mt-1 text-sm text-slate-400">Share of queue now in dispo</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {stageMetrics.map((item) => (
                <div
                  key={item.stage}
                  className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          item.stage
                        )}`}
                      >
                        {item.stage}
                      </span>
                      <p className="text-sm text-slate-300">{item.count} leads</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{item.percent}</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                      style={{ width: item.percent }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Follow Up Performance"
            description="Track how disciplined the team is with next touches and whether the queue is staying organized."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Scheduled
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{scheduledFollowUps.length}</p>
                <p className="mt-1 text-sm text-slate-400">Leads with a next touch date</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Due Rate
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {getPercent(followUpsDue.length, scheduledFollowUps.length)}
                </p>
                <p className="mt-1 text-sm text-slate-400">Share of scheduled follow-ups now due</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  CRM Coverage
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{contactCoverage}%</p>
                <p className="mt-1 text-sm text-slate-400">Recent logged activity vs lead count</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Follow-ups due now</p>
                  <p className="text-sm font-semibold text-rose-300">
                    {followUpsDue.length} / {scheduledFollowUps.length || 0}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
                    style={{
                      width: getPercent(followUpsDue.length, scheduledFollowUps.length || 1),
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  High due rates usually mean the team needs a stronger same-day follow-up push.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Leads without next step</p>
                  <p className="text-sm font-semibold text-amber-300">
                    {allLeads.length - scheduledFollowUps.length} / {allLeads.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{
                      width: getPercent(
                        allLeads.length - scheduledFollowUps.length,
                        allLeads.length || 1
                      ),
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  This is the part of the queue most likely to stall without tighter task discipline.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Hot Lead Board"
            description="The best opportunities to underwrite and work today."
          >
            <div className="space-y-3">
              {hotLeads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                  No hot leads yet. Use Finder and Map to source more opportunities.
                </div>
              ) : (
                hotLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/${lead.id}`}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{lead.address}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {lead.city}, {lead.state}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                        {lead.lead_score ?? '—'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getSignals(lead.lead_signals).map((signal) => (
                        <span
                          key={signal}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="New In Queue"
            description="Fresh leads that still need qualification and first contact."
          >
            <div className="space-y-3">
              {newLeads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                  No new leads waiting right now.
                </div>
              ) : (
                newLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/${lead.id}`}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <p className="font-semibold text-white">{lead.address}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {lead.city}, {lead.state}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                      <span>{lead.owner_name || 'Unknown owner'}</span>
                      <span>{formatDate(lead.created_at)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Under Contract"
            description="Deals that need dispo and close coordination."
          >
            <div className="space-y-3">
              {underContract.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                  No deals under contract yet.
                </div>
              ) : (
                underContract.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/${lead.id}`}
                    className="block rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
                  >
                    <p className="font-semibold text-white">{lead.address}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {lead.city}, {lead.state}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
                      <div>
                        <strong>Value:</strong> {formatMoney(lead.estimated_value)}
                      </div>
                      <div>
                        <strong>Offer:</strong> {formatMoney(lead.target_offer)}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}
