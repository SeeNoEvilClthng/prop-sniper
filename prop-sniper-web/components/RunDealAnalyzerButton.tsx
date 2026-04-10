'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RunDealAnalyzerButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRun = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/analyze-deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to run deal analyzer')
        return
      }

      alert('Deal analyzer finished.')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRun}
      disabled={loading}
      className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
    >
      {loading ? 'Running Numbers...' : 'Run Deal Analyzer'}
    </button>
  )
}