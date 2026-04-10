'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewInvestorForm() {
  const supabase = createClient()
  const router = useRouter()

  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [markets, setMarkets] = useState('')
  const [buyBox, setBuyBox] = useState('')
  const [propertyTypes, setPropertyTypes] = useState('')
  const [buyerType, setBuyerType] = useState('Cash Buyer')
  const [maxPrice, setMaxPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please log in first.')
      return
    }

    const { error } = await supabase.from('investors').insert({
      user_id: user.id,
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

    if (error) {
      setMessage(error.message)
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
        placeholder="Markets They Buy In (ex: Phoenix, Tempe, Mesa)"
        value={markets}
        onChange={(e) => setMarkets(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Buy Box (ex: 3/2+, light rehab, under 300k)"
        value={buyBox}
        onChange={(e) => setBuyBox(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Property Types (ex: Single Family, Duplex)"
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

      <button className="w-full rounded-xl bg-black p-3 text-white">
        Save Investor
      </button>

      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  )
}