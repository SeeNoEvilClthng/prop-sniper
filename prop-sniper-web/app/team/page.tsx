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
  lead_score?: number | null
  follow_up_date?: string | null
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

type ProfileRecord = {
  id: string
  email?: string | null
  role?: 'admin' | 'user' | null
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString()
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

function getPercent(value: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
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

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: leads }, { data: profiles }] = await Promise.all([
    supabase
      .from('leads')
      .select('id, address, city, state, status, lead_score, follow_up_date, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, email, role').order('email', { ascending: true }),
  ])

  const allLeads = (leads || []) as LeadRecord[]
  const allProfiles = (profiles || []) as ProfileRecord[]
  const leadIds = allLeads.map((lead) => lead.id)
  const leadMap = new Map(allLeads.map((lead) => [lead.id, lead]))

  let workflowAttempts: ContactAttemptRecord[] = []

  if (leadIds.length > 0) {
    const { data: attempts } = await supabase
      .from('contact_attempts')
      .select('id, lead_id, method, message, status, created_at')
      .in('lead_id', leadIds)
      .in('method', ['assignment', 'task'])
      .order('created_at', { ascending: false })

    workflowAttempts = (attempts || []) as ContactAttemptRecord[]
  }

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
      const assignment = lead?.id ? assignmentMap.get(lead.id) : undefined

      return {
        id: attempt.id,
        leadId: attempt.lead_id || '',
        leadAddress: lead?.address || 'Unknown lead',
        market: [lead?.city, lead?.state].filter(Boolean).join(', ') || 'Market unknown',
        assigneeId: assignment?.assigneeId || '',
        assigneeEmail: assignment?.assigneeEmail || 'Unassigned',
        title: parsed.title,
        dueDate: parsed.dueDate,
        details: parsed.details,
        status: attempt.status || 'open',
        createdAt: attempt.created_at || '',
      }
    })
    .filter((task) => task.status !== 'completed')

  const profileMap = new Map(
    allProfiles.map((profile) => [
      profile.id,
      {
        id: profile.id,
        email: profile.email || 'Unknown user',
        role: profile.role || 'user',
      },
    ])
  )

  const ownerMetrics = Array.from(
    assignmentMap.entries().reduce(
      (map, [leadId, assignment]) => {
        const lead = leadMap.get(leadId)
        if (!lead) return map

        const key = assignment?.assigneeId || `email:${assignment?.assigneeEmail || 'unassigned'}`
        const profile = assignment?.assigneeId ? profileMap.get(assignment.assigneeId) : null
        const existing = map.get(key) || {
          ownerId: assignment?.assigneeId || '',
          ownerEmail: assignment?.assigneeEmail || profile?.email || 'Unassigned',
          ownerLabel: formatOwnerLabel(assignment?.assigneeEmail || profile?.email || 'Unassigned'),
          role: assignment?.assigneeRole || profile?.role || 'user',
          leadCount: 0,
          hotLeadCount: 0,
          followUpsDue: 0,
          underContractCount: 0,
          totalScore: 0,
          leads: [] as LeadRecord[],
        }

        existing.leadCount += 1
        existing.totalScore += lead.lead_score ?? 0
        existing.leads.push(lead)
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
          role: string
          leadCount: number
          hotLeadCount: number
          followUpsDue: number
          underContractCount: number
          totalScore: number
          leads: LeadRecord[]
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
        overdueTaskCount: ownerTasks.filter((task) => isOpenTaskOverdue(task.dueDate, task.status))
          .length,
        nextLeads: [...metric.leads]
          .sort((a, b) => {
            const aDue = isDueTodayOrEarlier(a.follow_up_date) ? 1 : 0
            const bDue = isDueTodayOrEarlier(b.follow_up_date) ? 1 : 0
            if (aDue !== bDue) return bDue - aDue
            return (b.lead_score ?? 0) - (a.lead_score ?? 0)
          })
          .slice(0, 3),
        nextTasks: ownerTasks
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
          .slice(0, 3),
      }
    })
    .sort((a, b) => {
      if (b.overdueTaskCount !== a.overdueTaskCount) return b.overdueTaskCount - a.overdueTaskCount
      if (b.hotLeadCount !== a.hotLeadCount) return b.hotLeadCount - a.hotLeadCount
      return b.leadCount - a.leadCount
    })

  const totalOpenTasks = ownerMetrics.reduce((sum, owner) => sum + owner.openTaskCount, 0)
  const totalOverdueTasks = ownerMetrics.reduce((sum, owner) => sum + owner.overdueTaskCount, 0)
  const totalHotLeads = ownerMetrics.reduce((sum, owner) => sum + owner.hotLeadCount, 0)
  const totalDueFollowUps = ownerMetrics.reduce((sum, owner) => sum + owner.followUpsDue, 0)
  const mostLoadedOwner = ownerMetrics[0]
  const mostOverdueOwner = [...ownerMetrics].sort((a, b) => b.overdueTaskCount - a.overdueTaskCount)[0]

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_22%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200">Team Ops</p>
              <h1 className="mt-2 text-3xl font-bold">Team Performance</h1>
              <p className="mt-2 max-w-3xl text-slate-300">
                See rep load, overdue workflow risk, and where your strongest opportunities are sitting
                across the acquisitions team.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/leads"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open Lead Queue
              </Link>
              <Link
                href="/dashboard/new"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Add Lead
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Reps"
            value={String(ownerMetrics.length)}
            subtext="People currently carrying assigned pipeline"
          />
          <StatCard
            label="Assigned Leads"
            value={String(allLeads.length)}
            subtext="Total leads currently owned across the team"
          />
          <StatCard
            label="Open Tasks"
            value={String(totalOpenTasks)}
            subtext="Teamwide checklist items still in motion"
          />
          <StatCard
            label="Due Follow Ups"
            value={String(totalDueFollowUps)}
            subtext="Leads that should be touched today or earlier"
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Most Loaded Rep"
            value={mostLoadedOwner?.ownerLabel || '—'}
            subtext={
              mostLoadedOwner
                ? `${mostLoadedOwner.leadCount} leads • ${mostLoadedOwner.openTaskCount} open tasks`
                : 'No assignment activity yet'
            }
          />
          <StatCard
            label="Most At Risk"
            value={mostOverdueOwner?.ownerLabel || '—'}
            subtext={
              mostOverdueOwner
                ? `${mostOverdueOwner.overdueTaskCount} overdue tasks • ${mostOverdueOwner.followUpsDue} due follow-ups`
                : 'No overdue task pressure yet'
            }
          />
          <StatCard
            label="Hot Leads"
            value={String(totalHotLeads)}
            subtext="High-score opportunities spread across the team"
          />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Rep Load Board"
            description="A live owner-by-owner read of workload, task pressure, and pipeline quality."
          >
            {ownerMetrics.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                No ownership data yet. Assign a few leads and tasks to unlock the team view.
              </div>
            ) : (
              <div className="space-y-4">
                {ownerMetrics.map((owner) => (
                  <div
                    key={owner.key}
                    className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{owner.ownerLabel}</p>
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-white/10">
                            {owner.role}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{owner.ownerEmail}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                          {owner.leadCount} leads
                        </span>
                        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-400/30">
                          {owner.openTaskCount} tasks
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

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-[#0a1321] p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hot Leads</p>
                        <p className="mt-1 text-lg font-semibold text-white">{owner.hotLeadCount}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0a1321] p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Due Follow Ups</p>
                        <p className="mt-1 text-lg font-semibold text-white">{owner.followUpsDue}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0a1321] p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Avg Score</p>
                        <p className="mt-1 text-lg font-semibold text-white">{owner.avgScore}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0a1321] p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Under Contract</p>
                        <p className="mt-1 text-lg font-semibold text-white">{owner.underContractCount}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Priority Leads</p>
                        <div className="mt-2 space-y-2">
                          {owner.nextLeads.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1321] p-3 text-sm text-slate-400">
                              No leads assigned yet.
                            </div>
                          ) : (
                            owner.nextLeads.map((lead) => (
                              <Link
                                key={lead.id}
                                href={`/dashboard/${lead.id}`}
                                className="block rounded-2xl border border-white/10 bg-[#0a1321] p-3 transition hover:bg-[#101b2d]"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-white">{lead.address}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                                      {[lead.city, lead.state].filter(Boolean).join(', ')}
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                                    {lead.lead_score ?? '—'}
                                  </span>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next Tasks</p>
                        <div className="mt-2 space-y-2">
                          {owner.nextTasks.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1321] p-3 text-sm text-slate-400">
                              No open tasks right now.
                            </div>
                          ) : (
                            owner.nextTasks.map((task) => (
                              <Link
                                key={task.id}
                                href={task.leadId ? `/dashboard/${task.leadId}` : '/leads'}
                                className="block rounded-2xl border border-white/10 bg-[#0a1321] p-3 transition hover:bg-[#101b2d]"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-medium text-white">{task.title}</p>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      isOpenTaskOverdue(task.dueDate, task.status)
                                        ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
                                        : 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
                                    }`}
                                  >
                                    {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">{task.leadAddress}</p>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Manager Snapshot"
            description="A quick read on balance, risk, and where coaching should focus next."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Overdue team task share</p>
                  <p className="text-sm font-semibold text-rose-300">
                    {totalOverdueTasks} / {totalOpenTasks}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
                    style={{ width: getPercent(totalOverdueTasks, totalOpenTasks || 1) }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Rising overdue share usually means lead ownership exists, but execution is starting to slip.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Rep concentration</p>
                  <p className="text-sm font-semibold text-sky-300">
                    {mostLoadedOwner?.leadCount || 0} / {allLeads.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                    style={{
                      width: getPercent(mostLoadedOwner?.leadCount || 0, allLeads.length || 1),
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  If this gets too high, one rep is carrying too much of the pipeline.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Hot lead concentration</p>
                  <p className="text-sm font-semibold text-amber-300">
                    {totalHotLeads} / {allLeads.length}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: getPercent(totalHotLeads, allLeads.length || 1) }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  This helps you see whether the team is working enough top-end opportunities.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}
