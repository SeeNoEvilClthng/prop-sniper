'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzeDealButton({
  leadId,
  rehabLevel = 'medium',
}: {
  leadId: string
  rehabLevel?: 'light' | 'medium' | 'heavy'
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/analyze-deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId, rehabLevel }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to analyze deal')
        return
      }

      router.refresh()
      alert('Deal analysis updated')
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
    >
      {loading ? 'Analyzing...' : 'Run Deal Analyzer'}
    </button>
  )
}