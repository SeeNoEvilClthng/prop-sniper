'use client'

import { useState } from 'react'

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    try {
      setLoading(true)

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Checkout failed')
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      alert('Could not start checkout')
      setLoading(false)
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="rounded-xl bg-black px-5 py-3 text-white"
    >
      {loading ? 'Loading...' : 'Upgrade to Pro'}
    </button>
  )
}