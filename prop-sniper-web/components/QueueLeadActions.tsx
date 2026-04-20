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

export default function QueueLeadActions({
  leadId,
  currentStatus,
  currentFollowUpDate,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus || 'New')
  const [followUpDate, setFollowUpDate] = useState(currentFollowUpDate || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function saveWorkflow(next?: { status?: string; followUpDate?: string | null }) {
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
          status: next?.status ?? status,
          followUpDate:
            next?.followUpDate !== undefined ? next.followUpDate : followUpDate || null,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setMessage(data.error || 'Could not update lead')
        return
      }

      if (next?.status !== undefined) setStatus(next.status)
      if (next?.followUpDate !== undefined) setFollowUpDate(next.followUpDate || '')

      setMessage('Updated')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not update lead')
    } finally {
      setLoading(false)
    }
  }

  function scheduleFollowUp(daysFromNow: number) {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    void saveWorkflow({ followUpDate: date.toISOString().slice(0, 10) })
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Queue Actions
      </p>

      <div className="mt-4 grid gap-3">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
            Stage
          </label>
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/40"
            >
              {statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void saveWorkflow({ status })}
              disabled={loading}
              className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
            Follow Up
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/40"
            />
            <button
              type="button"
              onClick={() => void saveWorkflow({ followUpDate: followUpDate || null })}
              disabled={loading}
              className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => scheduleFollowUp(1)}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => scheduleFollowUp(3)}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            In 3 Days
          </button>
          <button
            type="button"
            onClick={() => void saveWorkflow({ followUpDate: null })}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        {message ? <p className="text-xs text-sky-200">{message}</p> : null}
      </div>
    </div>
  )
}
