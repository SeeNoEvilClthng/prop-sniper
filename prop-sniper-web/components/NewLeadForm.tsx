'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { enrichLeadFromAddress } from '@/lib/enrich-lead'

export default function NewLeadForm() {
  const supabase = createClient()
  const router = useRouter()

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [status, setStatus] = useState('New')
  const [notes, setNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`.trim()
    const enriched = await enrichLeadFromAddress(fullAddress)

    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      address,
      city,
      state,
      zip_code: zipCode || null,
      status,
      notes,
      follow_up_date: followUpDate || null,

      owner_name: enriched.owner_name,
      owner_occupied: enriched.owner_occupied,
      is_absentee_owner: enriched.is_absentee_owner,
      years_owned: enriched.years_owned,
      long_term_owner: enriched.long_term_owner,
      senior_owner_likely: enriched.senior_owner_likely,
      property_age: enriched.property_age,
      owner_type: enriched.owner_type,
      likely_distressed: enriched.likely_distressed,
      bedrooms: enriched.bedrooms,
      bathrooms: enriched.bathrooms,
      estimated_value: enriched.estimated_value,
      last_sale_date: enriched.last_sale_date,
      owner_phone: enriched.owner_phone,
      owner_email: enriched.owner_email,

      lead_score: enriched.lead_score,
      lead_rating: enriched.lead_rating,
      lead_signals: enriched.lead_signals,
    })

    if (error) {
      console.error(error)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <input
        className="w-full rounded-xl border p-3"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="ZIP Code"
        value={zipCode}
        onChange={(e) => setZipCode(e.target.value)}
      />

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

      <button type="submit" className="w-full rounded-xl bg-black p-3 text-white">
        Save Lead
      </button>
    </form>
  )
}