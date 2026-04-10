'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Investor = {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  markets: string | null
  buy_box: string | null
  property_types: string | null
  buyer_type: string | null
  max_price: number | null
  notes: string | null
}

export default function EditInvestorForm({ investor }: { investor: Investor }) {
  const supabase = createClient()
  const router = useRouter()

  const [companyName, setCompanyName] = useState(investor.company_name || '')
  const [contactName, setContactName] = useState(investor.contact_name || '')
  const [email, setEmail] = useState(investor.email || '')
  const [phone, setPhone] = useState(investor.phone || '')
  const [city, setCity] = useState(investor.city || '')
  const [state, setState] = useState(investor.state || '')
  const [markets, setMarkets] = useState(investor.markets || '')
  const [buyBox, setBuyBox] = useState(investor.buy_box || '')
  const [propertyTypes, setPropertyTypes] = useState(investor.property_types || '')
  const [buyerType, setBuyerType] = useState(investor.buyer_type || 'Cash Buyer')
  const [maxPrice, setMaxPrice] = useState(
    investor.max_price != null ? String(investor.max_price) : ''
  )
  const [notes, setNotes] = useState(investor.notes || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase
      .from('investors')
      .update({
        company_name: companyName,
        contact_name: contactName || null,
        email: email || null,
        phone: phone || null,
        city: city || null,
        state: state || null,
        markets: markets || null,
        buy_box: buyBox || null,
        property_types: propertyTypes || null,
        buyer_type: buyerType || null,
        max_price: maxPrice ? Number(maxPrice) : null,
        notes: notes || null,
      })
      .eq('id', investor.id)

    if (error) {
      console.error(error)
      return
    }

    router.push(`/investors/${investor.id}`)
    router.refresh()
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this investor?')
    if (!confirmed) return

    const { error } = await supabase.from('investors').delete().eq('id', investor.id)

    if (error) {
      console.error(error)
      return
    }

    router.push('/investors')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full rounded-xl border p-3"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Contact Name"
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Markets They Buy In"
        value={markets}
        onChange={(e) => setMarkets(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Buy Box"
        value={buyBox}
        onChange={(e) => setBuyBox(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Property Types"
        value={propertyTypes}
        onChange={(e) => setPropertyTypes(e.target.value)}
      />

      <select
        className="w-full rounded-xl border p-3"
        value={buyerType}
        onChange={(e) => setBuyerType(e.target.value)}
      >
        <option>Cash Buyer</option>
        <option>Flipper</option>
        <option>Landlord</option>
        <option>Hedge Fund</option>
        <option>JV Buyer</option>
        <option>Lender</option>
      </select>

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />

      <textarea
        className="w-full rounded-xl border p-3"
        rows={5}
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-3">
        <button className="rounded-xl bg-black px-5 py-3 text-white">
          Save Changes
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="rounded-xl border px-5 py-3"
        >
          Delete Investor
        </button>
      </div>
    </form>
  )
}