type LeadLike = {
  city?: string | null
  state?: string | null
  lead_score?: number | null
  estimated_value?: number | null
  owner_type?: string | null
}

type InvestorLike = {
  id?: string
  company_name?: string | null
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  state?: string | null
  markets?: string | null
  buy_box?: string | null
  property_types?: string | null
  buyer_type?: string | null
  max_price?: number | null
  notes?: string | null
  has_contact?: boolean | null
  is_public?: boolean | null
}

export type BuyerMatchResult = {
  score: number
  label: 'Best Buyer Match' | 'Strong Fit' | 'Likely Fit' | 'Possible Fit'
  reasons: string[]
}

function normalize(text: string | null | undefined) {
  return (text || '').toLowerCase().trim()
}

export function getBuyerMatch(
  lead: LeadLike,
  investor: InvestorLike
): BuyerMatchResult {
  let score = 0
  const reasons: string[] = []

  const leadCity = normalize(lead.city)
  const leadState = normalize(lead.state)
  const investorMarkets = normalize(investor.markets)
  const investorState = normalize(investor.state)
  const propertyTypes = normalize(investor.property_types)
  const buyBox = normalize(investor.buy_box)
  const buyerType = normalize(investor.buyer_type)

  if (leadCity && investorMarkets.includes(leadCity)) {
    score += 35
    reasons.push(`Buys in ${lead.city}`)
  }

  if (leadState && investorState && investorState.includes(leadState)) {
    score += 15
    reasons.push(`State match (${lead.state})`)
  }

  if (
    lead.estimated_value != null &&
    investor.max_price != null &&
    Number(lead.estimated_value) <= Number(investor.max_price)
  ) {
    score += 20
    reasons.push(`Within max price ($${Number(investor.max_price).toLocaleString()})`)
  } else if (lead.estimated_value == null || investor.max_price == null) {
    score += 5
    reasons.push('Price range not fully known')
  }

  if (
    propertyTypes.includes('single family') ||
    propertyTypes.includes('sfh') ||
    propertyTypes.includes('residential')
  ) {
    score += 10
    reasons.push('Property type preference looks compatible')
  }

  if (buyBox && lead.lead_score != null) {
    if (lead.lead_score >= 70) {
      score += 10
      reasons.push('High-scoring lead')
    } else if (lead.lead_score >= 55) {
      score += 5
      reasons.push('Good lead score')
    }
  }

  if (buyerType.includes('cash buyer')) {
    score += 5
    reasons.push('Cash buyer')
  }

  if (buyerType.includes('flipper')) {
    score += 5
    reasons.push('Flipper profile')
  }

  if (buyerType.includes('landlord')) {
    score += 3
    reasons.push('Landlord profile')
  }

  if (investor.has_contact === false) {
    score -= 5
  }

  if (score > 100) score = 100
  if (score < 0) score = 0

  let label: BuyerMatchResult['label'] = 'Possible Fit'
  if (score >= 75) label = 'Best Buyer Match'
  else if (score >= 60) label = 'Strong Fit'
  else if (score >= 40) label = 'Likely Fit'

  return { score, label, reasons }
}