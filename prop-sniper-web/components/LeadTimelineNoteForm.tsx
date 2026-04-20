'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LeadTimelineNoteForm({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return

    try {
      setLoading(true)
      setMessage('')

      const res = await fetch('/api/leads/note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          note,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setMessage(data.error || 'Could not save note')
        return
      }

      setNote('')
      setMessage('Note added to timeline')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not save note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-2xl border border-white/10 bg-[#0d1727] p-4">
      <label className="mb-2 block text-sm font-medium text-slate-200">
        Add Timeline Note
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Log seller context, objections, condition notes, or anything the next rep should know..."
        className="w-full rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !note.trim()}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Add Note'}
        </button>
        {message ? <p className="text-sm text-sky-200">{message}</p> : null}
      </div>
    </form>
  )
}
