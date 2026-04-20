'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function QueueLeadNoteForm({ leadId }: { leadId: string }) {
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
      setMessage('Queue note saved')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Could not save note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
    >
      <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
        Quick Note
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Log a seller objection, condition note, callback detail, or acquisition context..."
        className="w-full rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !note.trim()}
          className="rounded-xl bg-[linear-gradient(135deg,#e9d39a,#d7b56f)] px-4 py-2 text-sm font-semibold text-[#10151f] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Note'}
        </button>
        {message ? <p className="text-xs text-sky-200">{message}</p> : null}
      </div>
    </form>
  )
}
