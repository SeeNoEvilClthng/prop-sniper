import { getLeadSignals } from '@/lib/lead-summary'
import { openai } from '@/lib/openai'

export type FirstContactLead = {
  id: string
  address?: string | null
  city?: string | null
  state?: string | null
  owner_name?: string | null
  status?: string | null
  estimated_value?: number | null
  target_offer?: number | null
  estimated_repairs?: number | null
  lead_score?: number | null
  lead_rating?: string | null
  lead_signals?: string | null
  ai_analysis?: string | null
  notes?: string | null
}

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(Number(value))) return 'unknown'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function buildFallbackFirstContactMessage(lead: FirstContactLead) {
  const ownerName = lead.owner_name?.split(' ')[0]
  const intro = ownerName ? `Hi ${ownerName},` : 'Hi,'
  return `${intro} I wanted to reach out about the property at ${lead.address || 'your property'}. Not sure if you’d consider an offer, but if you are, I’d be happy to chat and see if it makes sense.`
}

export async function generateFirstContactMessage(lead: FirstContactLead) {
  const fallback = buildFallbackFirstContactMessage(lead)

  if (!process.env.OPENAI_API_KEY) {
    return {
      preview: true,
      message: fallback,
    }
  }

  const signals = getLeadSignals(lead).slice(0, 5)

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
    input: [
      {
        role: 'system',
        content: `
You write first-contact SMS messages for real-estate wholesalers.

Rules:
- Keep it under 320 characters
- Sound natural and human
- No emojis
- No fake urgency
- No legal claims
- Do not mention AI
- Goal is to get a reply, not pitch hard
- Mention the property naturally
- Do not sound spammy or overfamiliar
        `.trim(),
      },
      {
        role: 'user',
        content: `
Write one first-contact text message for this lead.

Property:
- Address: ${lead.address || 'Unknown'}
- City/State: ${[lead.city, lead.state].filter(Boolean).join(', ') || 'Unknown'}
- Estimated value: ${formatMoney(lead.estimated_value)}
- Target offer: ${formatMoney(lead.target_offer)}
- Estimated repairs: ${formatMoney(lead.estimated_repairs)}
- Lead score: ${lead.lead_score ?? 'unknown'}
- Lead rating: ${lead.lead_rating || 'unknown'}
- Signals: ${signals.length ? signals.join(', ') : 'none recorded'}
- Existing AI analysis: ${lead.ai_analysis || 'none'}
- Internal notes: ${lead.notes || 'none'}

Owner:
- Name: ${lead.owner_name || 'unknown'}

Make it sound like a real wholesaler making a respectful first contact.
        `.trim(),
      },
    ],
  })

  return {
    preview: false,
    message: response.output_text?.trim() || fallback,
  }
}
