'use client'

import { useState } from 'react'

type BuyerMatchSummary = {
  id?: string
  company_name?: string | null
  contact_name?: string | null
  email?: string | null
  score: number
  label: string
  reasons: string[]
}

type SendResponse = {
  success: boolean
  preview?: boolean
  message?: string
  recipientCount?: number
  topMatches?: BuyerMatchSummary[]
}

export default function SendToBuyersButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SendResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSend = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      setResult(null)

      const res = await fetch('/api/send-to-buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      })

      const data = (await res.json()) as SendResponse | { error?: string }

      if (!res.ok) {
        setErrorMessage((data as { error?: string }).error || 'Failed to send to buyers')
        return
      }

      setResult(data as SendResponse)
    } catch (error) {
      console.error(error)
      setErrorMessage('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleSend}
        disabled={loading}
        className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send to Buyers'}
      </button>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">
            {result.preview ? 'Buyer Blast Preview Ready' : 'Buyer Blast Sent'}
          </p>
          <p className="mt-1 text-slate-300">
            {result.message || 'Buyer workflow completed.'}
          </p>
          <p className="mt-2 text-slate-400">
            Matched buyers: {result.recipientCount ?? 0}
          </p>

          {result.topMatches?.length ? (
            <div className="mt-4 space-y-3">
              {result.topMatches.map((match) => (
                <div
                  key={`${match.id || match.email}-${match.score}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {match.company_name || match.contact_name || 'Unnamed buyer'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {match.email || 'No email'}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                      {match.score}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {match.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {match.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
