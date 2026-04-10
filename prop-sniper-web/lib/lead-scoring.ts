export type LeadScoringInput = {
  is_absentee_owner?: boolean | null
  long_term_owner?: boolean | null
  senior_owner_likely?: boolean | null
  likely_distressed?: boolean | null
  owner_occupied?: boolean | null
  property_age?: number | null
  years_owned?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
}

export type LeadScoringResult = {
  score: number
  rating: string
  signals: string[]
}

export function scoreLead(input: LeadScoringInput): LeadScoringResult {
  let score = 35
  const signals: string[] = []

  if (input.is_absentee_owner) {
    score += 15
    signals.push('Absentee Owner')
  }

  if (input.long_term_owner) {
    score += 15
    signals.push('Long-Term Owner')
  }

  if (input.senior_owner_likely) {
    score += 10
    signals.push('Senior Owner Likely')
  }

  if (input.likely_distressed) {
    score += 15
    signals.push('Possible Distress')
  }

  if ((input.property_age || 0) >= 40) {
    score += 10
    signals.push('Older Property')
  }

  if (input.owner_occupied) {
    score += 5
    signals.push('Owner Occupied')
  }

  if ((input.bedrooms || 0) >= 3) {
    score += 3
  }

  if ((input.bathrooms || 0) >= 2) {
    score += 2
  }

  if (score > 100) score = 100
  if (score < 0) score = 0

  let rating = 'Weak'
  if (score >= 85) rating = 'Hot'
  else if (score >= 70) rating = 'Strong'
  else if (score >= 55) rating = 'Good'
  else if (score >= 40) rating = 'Fair'

  return { score, rating, signals }
}