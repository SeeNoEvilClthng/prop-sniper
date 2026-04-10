type EnrichedLead = {
  owner_name: string | null
  owner_occupied: boolean | null
  is_absentee_owner: boolean | null
  years_owned: number | null
  long_term_owner: boolean | null
  senior_owner_likely: boolean | null
  property_age: number | null
  owner_type: string | null
  likely_distressed: boolean
  bedrooms: number | null
  bathrooms: number | null
  estimated_value: number | null
  last_sale_date: string | null
  owner_phone: string | null
  owner_email: string | null
  lead_score: number
  lead_rating: string
  lead_signals: string
}

function emptyResult(): EnrichedLead {
  return {
    owner_name: null,
    owner_occupied: null,
    is_absentee_owner: null,
    years_owned: null,
    long_term_owner: null,
    senior_owner_likely: null,
    property_age: null,
    owner_type: null,
    likely_distressed: false,
    bedrooms: null,
    bathrooms: null,
    estimated_value: null,
    last_sale_date: null,
    owner_phone: null,
    owner_email: null,
    lead_score: 35,
    lead_rating: 'Weak',
    lead_signals: '',
  }
}

export async function enrichLeadFromAddress(address: string): Promise<EnrichedLead> {
  if (!address.trim()) return emptyResult()

  try {
    const res = await fetch(`/api/enrich?address=${encodeURIComponent(address)}`, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!res.ok) {
      return emptyResult()
    }

    const data = await res.json()

    return {
      ...emptyResult(),
      ...data,
    }
  } catch {
    return emptyResult()
  }
}