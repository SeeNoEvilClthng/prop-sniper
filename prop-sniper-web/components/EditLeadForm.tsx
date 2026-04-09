'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditLeadForm({ lead }: any) {
  const supabase = createClient()
  const router = useRouter()

  const [status, setStatus] = useState(lead.status || 'New')
  const [notes, setNotes] = useState(lead.notes || '')
  const [followUpDate, setFollowUpDate] = useState(
    lead.follow_up_date || ''
  )

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase
      .from('leads')
      .update({
        status,
        notes,
        follow_up_date: followUpDate || null,
      })
      .eq('id', lead.id)

    if (error) {
      console.error(error)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleUpdate} className="mt-6 space-y-4">
      <select
        className="w-full rounded-xl border p-3"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>New</option>
        <option>Contacted</option>
        <option>Follow Up</option>
        <option>Negotiating</option>
        <option>Under Contract</option>
        <option>Dead</option>
      </select>

      <textarea
        className="w-full rounded-xl border p-3"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
      />

      <input
        className="w-full rounded-xl border p-3"
        type="date"
        value={followUpDate}
        onChange={(e) => setFollowUpDate(e.target.value)}
      />

      <button className="w-full rounded-xl bg-black p-3 text-white">
        Update Lead
      </button>
    </form>
  )
}