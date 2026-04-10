'use client'

import { useState } from 'react'

export default function SendToBuyersButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/send-to-buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to send to buyers')
        return
      }

      alert('Deal sent to buyers 🚀')
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
    >
      {loading ? 'Sending...' : 'Send to Buyers'}
    </button>
  )
}