import { NextRequest, NextResponse } from 'next/server'
import { scoreLead } from '@/lib/lead-scoring'

type RentCastProperty = {
  bedrooms?: number
  bathrooms?: number
  yearBuilt?: number
  ownerOccupied?: boolean
  owner?: {
    type?: string
    names?: string[]
  }
  lastSaleDate?: string
  features?: {
    bedrooms?: number
    bathrooms?: number
  }
}

type RentCastValue = {
  price?: number
}

function getYearsOwned(lastSaleDate?: string) {
  if (!lastSaleDate) return null

  const saleDate = new Date(lastSaleDate)
  if (Number.isNaN(saleDate.getTime())) return null

  const now = new Date()
  let years = now.getFullYear() - saleDate.getFullYear()

  const monthDiff = now.getMonth() - saleDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < saleDate.getDate())) {
    years--
  }

  return years < 0 ? 0 : years
}

function emptyResult() {
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

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  if (!process.env.RENTCAST_API_KEY) {
    return NextResponse.json(emptyResult())
  }

  try {
    const propertyUrl = new URL('https://api.rentcast.io/v1/properties')
    propertyUrl.searchParams.set('address', address)

    const propertyRes = await fetch(propertyUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Api-Key': process.env.RENTCAST_API_KEY,
      },
      cache: 'no-store',
    })

    if (!propertyRes.ok) {
      return NextResponse.json(emptyResult())
    }

    const propertyData = (await propertyRes.json()) as RentCastProperty[]
    const property = propertyData?.[0]

    if (!property) {
      return NextResponse.json(emptyResult())
    }

    let estimatedValue: number | null = null

    try {
      const valueUrl = new URL('https://api.rentcast.io/v1/avm/value')
      valueUrl.searchParams.set('address', address)

      const valueRes = await fetch(valueUrl.toString(), {
        headers: {
          Accept: 'application/json',
          'X-Api-Key': process.env.RENTCAST_API_KEY!,
        },
        cache: 'no-store',
      })

      if (valueRes.ok) {
        const valueData = (await valueRes.json()) as RentCastValue
        estimatedValue = valueData?.price ?? null
      }
    } catch {}

    const currentYear = new Date().getFullYear()
    const propertyAge = property.yearBuilt ? currentYear - property.yearBuilt : null
    const yearsOwned = getYearsOwned(property.lastSaleDate)
    const ownerOccupied = property.ownerOccupied ?? null
    const isAbsenteeOwner = ownerOccupied === false
    const longTermOwner = (yearsOwned ?? 0) >= 15
    const seniorOwnerLikely = (yearsOwned ?? 0) >= 20 && ownerOccupied === true
    const likelyDistressed =
      isAbsenteeOwner || longTermOwner || (propertyAge ?? 0) >= 40

    const bedrooms = property.bedrooms ?? property.features?.bedrooms ?? null
    const bathrooms = property.bathrooms ?? property.features?.bathrooms ?? null

    const scored = scoreLead({
      is_absentee_owner: isAbsenteeOwner,
      long_term_owner: longTermOwner,
      senior_owner_likely: seniorOwnerLikely,
      likely_distressed: likelyDistressed,
      owner_occupied: ownerOccupied,
      property_age: propertyAge,
      years_owned: yearsOwned,
      bedrooms,
      bathrooms,
    })

    return NextResponse.json({
      owner_name: property.owner?.names?.[0] || null,
      owner_occupied: ownerOccupied,
      is_absentee_owner: isAbsenteeOwner,
      years_owned: yearsOwned,
      long_term_owner: longTermOwner,
      senior_owner_likely: seniorOwnerLikely,
      property_age: propertyAge,
      owner_type: property.owner?.type || null,
      likely_distressed: likelyDistressed,
      bedrooms,
      bathrooms,
      estimated_value: estimatedValue,
      last_sale_date: property.lastSaleDate || null,
      owner_phone: null,
      owner_email: null,
      lead_score: scored.score,
      lead_rating: scored.rating,
      lead_signals: scored.signals.join(', '),
    })
  } catch {
    return NextResponse.json(emptyResult())
  }
}