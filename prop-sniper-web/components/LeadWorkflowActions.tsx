'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const statusOptions = [
  'New',
  'Contacted',
  'Follow Up',
  'Negotiating',
  'Under Contract',
  'Dead',
] as const

type Props = {
  leadId: string
  currentStatus?: string | null
  currentFollowUpDate?: string | null
}

export default function LeadWorkflowActions({
  leadId,
  currentStatus,
  currentFollowUpDate,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus || 'New')
  const [followUpDate, setFollowUpDate] = useState(currentFollowUpDate || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function saveWorkflow(next: { status?: string; followUpDate?: string | null }) {
    try {
      setLoading(true)
      setMessage('')

      const res = await fetch('/api/leads/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          status: next.status ?? status,
          followUpDate:
            next.followUpDate !== undefined ? next.followUpDate : followUpDate || null,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setMessage(data.error || 'Could not update workflow')
        return
      }

      if (next.status !== undefined) setStatus(next.status)
      if (next.followUpDate !== undefined) setFollowUpDate(next.followUpDate || '')

      setMessage('Workflow updated')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not update workflow')
    } finally {
      setLoading(false)
    }
  }

  function handleQuickFollowUp(daysFromNow: number) {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    const iso = date.toISOString().slice(0, 10)
    void saveWorkflow({ followUpDate: iso })
  }

  return (
    <div className="space-y-4 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Workflow Controls</h2>
        <p className="mt-2 text-slate-300">
          Update deal stage and set the next seller touchpoint without leaving the workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
          >
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Next Follow Up</label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void saveWorkflow({ status, followUpDate: followUpDate || null })}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Workflow'}
        </button>

        <button
          type="button"
          onClick={() => handleQuickFollowUp(1)}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          Follow Up Tomorrow
        </button>

        <button
          type="button"
          onClick={() => handleQuickFollowUp(3)}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          Follow Up In 3 Days
        </button>

        <button
          type="button"
          onClick={() => void saveWorkflow({ followUpDate: null })}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          Clear Follow Up
        </button>
      </div>

      {message ? <p className="text-sm text-sky-200">{message}</p> : null}
    </div>
  )
}
