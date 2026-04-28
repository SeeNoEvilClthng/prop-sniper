import Link from 'next/link'
import { redirect } from 'next/navigation'

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
  lead_signals?: string | null
  follow_up_date?: string | null
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
    <div className="rounded-[20px] border border-white/8 bg-[#0b0f18]/92 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{subtext}</p>
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
    <section className="rounded-[22px] border border-white/8 bg-[#0a0e17]/92 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="border-b border-white/6 pb-4">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DashboardLinkCard({
  href,
  title,
  subtitle,
  meta,
  badge,
  chips = [],
  detail,
}: {
  href: string
  title: string
  subtitle?: string
  meta?: string
  badge?: React.ReactNode
  chips?: React.ReactNode[]
  detail?: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-[18px] border border-white/8 bg-[#0c111b]/88 px-4 py-3 transition hover:border-white/14 hover:bg-[#101624]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
          {meta ? (
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">{meta}</p>
          ) : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
      {chips.length ? <div className="mt-2 flex flex-wrap gap-2">{chips}</div> : null}
      {detail ? <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p> : null}
    </Link>
  )
}

function QueueStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[#0c111b]/88 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
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
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const myAssignedLeads = allLeads
    .filter((lead) => {
      const assignment = assignmentMap.get(lead.id)
      return assignment?.assigneeId ? assignment.assigneeId === user.id : true
    })
    .sort((a, b) => {
      const aDue = isDueTodayOrEarlier(a.follow_up_date) ? 1 : 0
      const bDue = isDueTodayOrEarlier(b.follow_up_date) ? 1 : 0
      if (aDue !== bDue) return bDue - aDue
      return (b.lead_score ?? 0) - (a.lead_score ?? 0)
    })

  const myOpenTasks = openTasks.filter((task) => (task.assigneeId ? task.assigneeId === user.id : true))

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

      return {
        key,
        ...metric,
        avgScore: metric.leadCount ? Math.round(metric.totalScore / metric.leadCount) : 0,
        openTaskCount: ownerTasks.length,
      }
    })
    .sort((a, b) => {
      if (b.hotLeadCount !== a.hotLeadCount) return b.hotLeadCount - a.hotLeadCount
      return b.leadCount - a.leadCount
    })

  const stageMetrics = pipelineStages.map((stage) => {
    const count = allLeads.filter((lead) => (lead.status || 'New') === stage).length
    return { stage, count, percent: getPercent(count, allLeads.length) }
  })

  const avgLeadScore = allLeads.length
    ? Math.round(allLeads.reduce((sum, lead) => sum + (lead.lead_score ?? 0), 0) / allLeads.length)
    : 0
  const activeLeadCount = allLeads.filter(
    (lead) => !['Dead', 'Under Contract'].includes(lead.status || 'New')
  ).length
  const contactCoverage = allLeads.length ? Math.round((recentAttempts.length / allLeads.length) * 100) : 0

  const dashboardLanes = [
    {
      label: 'Leads',
      title: 'Source, sort, and qualify opportunities',
      detail: 'Map, finder, and queue workflows for the acquisition side.',
      metric: `${newLeads.length} fresh`,
      href: '/leads',
    },
    {
      label: 'CRM',
      title: 'Run follow-up with clear next actions',
      detail: 'Keep overdue follow-ups and seller tasks from slipping.',
      metric: `${followUpsDue.length} due`,
      href: '/leads?follow_up=Due',
    },
    {
      label: 'Dispo',
      title: 'Move clean deals to buyers faster',
      detail: 'Keep investor demand connected to contract-ready files.',
      metric: `${underContract.length} live`,
      href: '/investors',
    },
    {
      label: 'AI',
      title: 'Use score and signals to prioritize',
      detail: 'Let scoring and activity point the team to better deals first.',
      metric: `${avgLeadScore} avg`,
      href: '/dashboard/analyzer',
    },
  ]

  const dashboardShortcuts = [
    {
      label: 'Lead Queue',
      href: '/leads',
      description: 'Work acquisitions from the full queue',
      icon: '◎',
    },
    {
      label: 'Finder',
      href: '/finder',
      description: 'Source more motivated sellers by market',
      icon: '✦',
    },
    {
      label: 'Map',
      href: '/map',
      description: 'Visualize clusters and drive new streets',
      icon: '▣',
    },
    {
      label: 'Buyer CRM',
      href: '/investors',
      description: 'Match live deals to investor demand',
      icon: '↗',
    },
    {
      label: 'Team Ops',
      href: '/team',
      description: 'See rep load, hot leads, and task pressure',
      icon: '◈',
    },
    {
      label: 'Deal Analyzer',
      href: '/dashboard/analyzer',
      description: 'Underwrite spread and tighten offers',
      icon: '◌',
    },
  ]

  const aiSuggestions = [
    hotLeads[0]
      ? {
          title: `Press ${hotLeads[0].address} today`,
          detail: `${hotLeads[0].lead_score || 0} score with ${getSignals(hotLeads[0].lead_signals).join(', ') || 'strong motivation signals'}.`,
        }
      : null,
    followUpsDue[0]
      ? {
          title: `Clear overdue follow-up on ${followUpsDue[0].address}`,
          detail: 'This lead is already due and should be moved back into contact rhythm now.',
        }
      : null,
    underContract[0]
      ? {
          title: `Prep buyer push for ${underContract[0].address}`,
          detail: 'Active contract inventory is your fastest dispo leverage right now.',
        }
      : null,
  ].filter(Boolean) as Array<{ title: string; detail: string }>

  const topOwners = ownerMetrics.slice(0, 3)

  return (
    <main className="text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[22px] border border-white/8 bg-[#090d16]/94 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#c4b5fd]">Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                Your next actions, not the whole business at once
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Work owned leads, clear follow-ups, and jump into the right tool without digging through a full report wall.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/new"
                className="rounded-xl bg-[linear-gradient(135deg,#9333ea,#6d28d9)] px-4 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                Add Lead
              </Link>
              <Link
                href="/leads?follow_up=Due"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Follow Ups
              </Link>
              <Link
                href="/finder"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Finder
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="My Leads" value={String(myAssignedLeads.length)} subtext="Records currently assigned to you" />
          <StatCard label="Follow Ups Due" value={String(followUpsDue.length)} subtext="Leads that need contact today" />
          <StatCard label="My Open Tasks" value={String(myOpenTasks.length)} subtext="Tasks still sitting in your inbox" />
          <StatCard
            label="Buyer Network"
            value={String(investorCount || 0)}
            subtext={`${underContract.length} under contract • ${contactAttemptCount || 0} CRM events`}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Priority Work"
            description="The leads and tasks most likely to need your attention first."
          >
            <div className="space-y-2">
              {myAssignedLeads.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-[#0c111b]/88 p-4 text-sm text-slate-400">
                  No leads are assigned to you yet.
                </div>
              ) : (
                myAssignedLeads.slice(0, 5).map((lead) => (
                  <DashboardLinkCard
                    key={lead.id}
                    href={`/dashboard/${lead.id}`}
                    title={lead.address || 'Unknown lead'}
                    subtitle={[lead.city, lead.state].filter(Boolean).join(', ')}
                    badge={
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10">
                        {lead.lead_score ?? '—'}
                      </span>
                    }
                    chips={[
                      <span
                        key="status"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(lead.status)}`}
                      >
                        {lead.status || 'New'}
                      </span>,
                      ...(lead.follow_up_date
                        ? [
                            <span
                              key="follow-up"
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isDueTodayOrEarlier(lead.follow_up_date)
                                  ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30'
                                  : 'bg-white/10 text-slate-300 ring-1 ring-white/10'
                              }`}
                            >
                              {isDueTodayOrEarlier(lead.follow_up_date) ? 'Due' : 'Next'}{' '}
                              {formatDate(lead.follow_up_date)}
                            </span>,
                          ]
                        : []),
                    ]}
                    detail={
                      getSignals(lead.lead_signals).join(' • ') ||
                      lead.owner_name ||
                      'No motivation signals recorded yet.'
                    }
                  />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Tasks Due"
            description="Open seller tasks, with overdue work kept near the top."
          >
            <div className="space-y-2">
              {myOpenTasks.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-[#0c111b]/88 p-4 text-sm text-slate-400">
                  No open tasks in your inbox.
                </div>
              ) : (
                myOpenTasks.slice(0, 5).map((task) => (
                  <DashboardLinkCard
                    key={task.id}
                    href={`/dashboard/${task.leadId}`}
                    title={task.title}
                    subtitle={task.leadAddress}
                    meta={task.market}
                    badge={
                      task.dueDate ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isOpenTaskOverdue(task.dueDate, task.status)
                              ? 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30'
                              : 'bg-white/10 text-slate-300 ring-1 ring-white/10'
                          }`}
                        >
                          {isOpenTaskOverdue(task.dueDate, task.status) ? 'Overdue' : 'Due'}{' '}
                          {formatDate(task.dueDate)}
                        </span>
                      ) : null
                    }
                    detail={task.details || 'No extra task details recorded.'}
                  />
                ))
              )}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Quick Access"
            description="The few places you should need most often."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {dashboardShortcuts.map((shortcut) => (
                <Link
                  key={shortcut.label}
                  href={shortcut.href}
                  className="rounded-[18px] border border-white/8 bg-[#0c111b]/88 p-4 transition hover:border-white/14 hover:bg-[#101624]"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{shortcut.icon}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{shortcut.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{shortcut.description}</p>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="What Needs Attention"
            description="Small cues so you can move without opening ten tabs."
          >
            <div className="space-y-2">
              {aiSuggestions.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-[#0c111b]/88 p-4 text-sm text-slate-400">
                  Add more active leads to generate workflow suggestions.
                </div>
              ) : (
                aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.title}
                    className="rounded-[18px] border border-white/8 bg-[#0c111b]/88 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{suggestion.title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{suggestion.detail}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <SectionCard
            title="Pipeline Snapshot"
            description="A compact read on where your lead flow is sitting right now."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <QueueStat label="Avg Score" value={String(avgLeadScore)} />
              <QueueStat label="Active Leads" value={String(activeLeadCount)} />
              <QueueStat label="CRM Coverage" value={`${contactCoverage}%`} />
            </div>

            <div className="mt-5 space-y-4">
              {stageMetrics.map((stage) => (
                <div key={stage.stage}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{stage.stage}</span>
                    <span>
                      {stage.count} • {stage.percent}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-500"
                      style={{ width: stage.percent }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Core Lanes"
            description="The four main surfaces your team works from."
          >
            <div className="space-y-2">
              {dashboardLanes.map((lane) => (
                <DashboardLinkCard
                  key={lane.label}
                  href={lane.href}
                  title={lane.title}
                  subtitle={lane.detail}
                  meta={lane.label}
                  badge={
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200 ring-1 ring-violet-400/30">
                      {lane.metric}
                    </span>
                  }
                />
              ))}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <SectionCard
            title="Recent Activity"
            description="The latest CRM activity across your pipeline."
          >
            <div className="space-y-2">
              {recentActivity.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-[#0c111b]/88 p-4 text-sm text-slate-400">
                  No CRM activity logged yet.
                </div>
              ) : (
                recentActivity.slice(0, 6).map((item) => (
                  <DashboardLinkCard
                    key={item.id}
                    href={`/dashboard/${item.leadId}`}
                    title={item.leadAddress}
                    subtitle={item.detail}
                    meta={`${item.title} • ${item.market}`}
                    badge={
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getMethodClasses(item.method)}`}
                      >
                        {item.title}
                      </span>
                    }
                    detail={formatDateTime(item.timestamp)}
                  />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Team Snapshot"
            description="A simple read on rep load without turning this page into a manager report."
          >
            <div className="space-y-2">
              {topOwners.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-[#0c111b]/88 p-4 text-sm text-slate-400">
                  No ownership data yet.
                </div>
              ) : (
                topOwners.map((owner) => (
                  <DashboardLinkCard
                    key={owner.key}
                    href="/team"
                    title={owner.ownerLabel}
                    subtitle={`${owner.leadCount} leads • ${owner.openTaskCount} open tasks`}
                    badge={
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10">
                        Avg {owner.avgScore}
                      </span>
                    }
                    chips={[
                      <span
                        key="due"
                        className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30"
                      >
                        {owner.followUpsDue} due
                      </span>,
                      <span
                        key="hot"
                        className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-200 ring-1 ring-rose-400/30"
                      >
                        {owner.hotLeadCount} hot
                      </span>,
                    ]}
                    detail={`${owner.underContractCount} under contract`}
                  />
                ))
              )}
            </div>

            <div className="mt-4 rounded-[18px] border border-white/8 bg-[#0c111b]/88 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Need more detail?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/leads"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Lead Queue
                </Link>
                <Link
                  href="/finder"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Finder
                </Link>
                <Link
                  href="/investors"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Buyer CRM
                </Link>
                <Link
                  href="/team"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Team
                </Link>
              </div>
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  )
}
