export async function runDealAnalyzerForLead(leadId: string) {
  try {
    const res = await fetch('/api/analyze-deal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Deal analyzer failed:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Deal analyzer request failed:', error)
    return false
  }
}