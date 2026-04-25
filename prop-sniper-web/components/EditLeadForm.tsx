'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { enrichLeadFromAddress } from '@/lib/enrich-lead'

type Lead = {
  id: string
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  owner_phone: string | null
  status: string | null
  notes: string | null
  follow_up_date: string | null
  rehab_level: string | null
}

export default function EditLeadForm({ lead }: { lead: Lead }) {
  const supabase = createClient()
  const router = useRouter()

  const [address, setAddress] = useState(lead.address || '')
  const [city, setCity] = useState(lead.city || '')
  const [state, setState] = useState(lead.state || '')
  const [zipCode, setZipCode] = useState(lead.zip_code || '')
  const [ownerPhone, setOwnerPhone] = useState(lead.owner_phone || '')
  const [status, setStatus] = useState(lead.status || 'New')
  const [notes, setNotes] = useState(lead.notes || '')
  const [followUpDate, setFollowUpDate] = useState(lead.follow_up_date || '')
  const [rehabLevel, setRehabLevel] = useState(lead.rehab_level || 'medium')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}`.trim()
      const enriched = await enrichLeadFromAddress(fullAddress)

      const { error } = await supabase
        .from('leads')
        .update({
          address,
          city,
          state,
          zip_code: zipCode || null,
          status,
          notes,
          follow_up_date: followUpDate || null,
          rehab_level: rehabLevel,

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
          owner_phone: ownerPhone.trim() || enriched.owner_phone || null,
          owner_email: enriched.owner_email,

          lead_score: enriched.lead_score,
          lead_rating: enriched.lead_rating,
          lead_signals: enriched.lead_signals,
        })
        .eq('id', lead.id)

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const analysisRes = await fetch('/api/analyze-deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId: lead.id }),
      })

      if (!analysisRes.ok) {
        const data = await analysisRes.json().catch(() => null)
        setMessage(
          data?.error
            ? `Lead updated, but analyzer failed: ${data.error}`
            : 'Lead updated, but analyzer failed.'
        )
      }

      router.push(`/dashboard/${lead.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this lead?')
    if (!confirmed) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('leads').delete().eq('id', lead.id)

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Owner Phone Number"
        value={ownerPhone}
        onChange={(e) => setOwnerPhone(e.target.value)}
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

      <select
        className="w-full rounded-xl border p-3"
        value={rehabLevel}
        onChange={(e) => setRehabLevel(e.target.value)}
      >
        <option value="light">Light Rehab</option>
        <option value="medium">Medium Rehab</option>
        <option value="heavy">Heavy Rehab</option>
      </select>

      <textarea
        className="w-full rounded-xl border p-3"
        rows={4}
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        type="date"
        value={followUpDate}
        onChange={(e) => setFollowUpDate(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-xl border px-5 py-3 disabled:opacity-50"
        >
          Delete Lead
        </button>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  )
}
