import type { LeadStatus } from '@/lib/outreach/workflow'

type ScoreLeadInput = {
  motivation?: string | null
  condition?: string | null
  timeline?: string | null
  askingPrice?: number | string | null
  aiSummary?: string | null
  phone?: string | null
  email?: string | null
}

type ScoreLeadResult = {
  motivationScore: number
  conditionScore: number
  timelineScore: number
  priceScore: number
  contactScore: number
  totalScore: number
  status: Extract<LeadStatus, 'qualified_hot' | 'qualified_warm' | 'qualified_cold'>
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value))
}

function normalizeText(value?: string | null) {
  return (value || '').trim().toLowerCase()
}

export function scoreLead(input: ScoreLeadInput): ScoreLeadResult {
  const motivationText = `${normalizeText(input.motivation)} ${normalizeText(input.aiSummary)}`
  const conditionText = normalizeText(input.condition)
  const timelineText = normalizeText(input.timeline)
  const priceText = `${String(input.askingPrice ?? '').toLowerCase()} ${normalizeText(input.aiSummary)}`

  const motivationScore = includesAny(motivationText, [
    'divorce',
    'probate',
    'vacant',
    'tired landlord',
    'distressed',
    'behind on payments',
    'preforeclosure',
    'foreclosure',
    'moving',
    'inherit',
    'inherited',
    'needs to sell',
    'motivated',
    'urgent',
  ])
    ? 30
    : 0

  const timelineScore = includesAny(timelineText, [
    'asap',
    'immediately',
    '2 week',
    'two week',
    '3 week',
    'three week',
    '30 day',
    'this month',
    'next few weeks',
  ])
    ? 25
    : 0

  const conditionScore = includesAny(conditionText, [
    'repair',
    'repairs',
    'update',
    'updating',
    'needs work',
    'rough',
    'damaged',
    'fixer',
    'deferred maintenance',
  ])
    ? 20
    : 0

  const priceScore = includesAny(priceText, [
    'flexible',
    'negotiable',
    'best offer',
    'open to offers',
    'not sure',
  ])
    ? 20
    : 0

  const contactScore = input.phone || input.email ? 5 : 0
  const totalScore = motivationScore + timelineScore + conditionScore + priceScore + contactScore

  const status =
    totalScore >= 80
      ? 'qualified_hot'
      : totalScore >= 50
        ? 'qualified_warm'
        : 'qualified_cold'

  return {
    motivationScore,
    conditionScore,
    timelineScore,
    priceScore,
    contactScore,
    totalScore,
    status,
  }
}
