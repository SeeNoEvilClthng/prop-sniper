export const leadStatuses = [
  'new_lead',
  'text_sent',
  'replied',
  'ai_calling',
  'qualified_hot',
  'qualified_warm',
  'qualified_cold',
  'appointment_booked',
  'closed',
  'dead',
  'do_not_contact',
] as const

export type LeadStatus = (typeof leadStatuses)[number]

const interestPatterns = [
  /\byes\b/i,
  /\bsure\b/i,
  /\bmaybe\b/i,
  /\bwhat'?s up\b/i,
  /\binterested\b/i,
  /\bcall me\b/i,
  /\bok\b/i,
  /\bokay\b/i,
  /\byeah\b/i,
  /\byup\b/i,
  /\byep\b/i,
]

const optOutPatterns = [
  /\bstop\b/i,
  /\bunsubscribe\b/i,
  /\bremove me\b/i,
  /\bwrong number\b/i,
  /\bnot interested\b/i,
  /\bno thanks\b/i,
  /\bno\b/i,
]

export function normalizePhoneNumber(value?: string | null) {
  if (!value) return ''
  return value.replace(/[^\d+]/g, '')
}

export function classifySellerReply(message?: string | null) {
  const text = (message || '').trim()

  if (!text) {
    return 'neutral' as const
  }

  if (optOutPatterns.some((pattern) => pattern.test(text))) {
    if (/\bstop\b/i.test(text) || /\bunsubscribe\b/i.test(text) || /\bwrong number\b/i.test(text)) {
      return 'do_not_contact' as const
    }

    return 'dead' as const
  }

  if (interestPatterns.some((pattern) => pattern.test(text))) {
    return 'interested' as const
  }

  return 'neutral' as const
}

export function buildSafeFirstText(propertyAddress?: string | null) {
  return `Hi, is this the owner of ${propertyAddress || 'the property'}? I had a quick question about the property.`
}

export function ensureUnsubscribeLanguage(message: string) {
  if (/reply\s+stop\s+to\s+opt\s+out/i.test(message)) {
    return message
  }

  return `${message.trim()} Reply STOP to opt out.`
}

export function isBlockedOutreachStatus(status?: string | null) {
  return status === 'do_not_contact' || status === 'dead'
}
