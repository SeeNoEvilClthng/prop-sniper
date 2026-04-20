'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type AssigneeOption = {
  id: string
  email: string
  role: string
}

type Props = {
  leadId: string
  currentAssigneeId?: string
  currentAssigneeEmail?: string
  options: AssigneeOption[]
}

export default function LeadAssignmentCard({
  leadId,
  currentAssigneeId,
  currentAssigneeEmail,
  options,
}: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(currentAssigneeId || options[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function saveAssignment() {
    const option = options.find((item) => item.id === selectedId) || options[0]
    if (!option) return

    try {
      setLoading(true)
      setMessage('')

      const res = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          assigneeId: option.id,
          assigneeEmail: option.email,
          assigneeRole: option.role,
        }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setMessage(data.error || 'Could not assign lead')
        return
      }

      setMessage('Assignment updated')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not assign lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Lead Owner</h2>
        <p className="mt-2 text-slate-300">
          Route this lead to the right rep so ownership is clear across the pipeline.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Currently Assigned</p>
        <p className="mt-2 text-sm font-semibold text-white">
          {currentAssigneeEmail || options[0]?.email || 'Unassigned'}
        </p>
      </div>

      <div className="space-y-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.email} ({option.role})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => void saveAssignment()}
          disabled={loading || !selectedId}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Assignment'}
        </button>

        {message ? <p className="text-sm text-sky-200">{message}</p> : null}
      </div>
    </div>
  )
}
