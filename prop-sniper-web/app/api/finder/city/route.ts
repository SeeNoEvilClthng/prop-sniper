import { NextResponse } from 'next/server'

type RentCastProperty = {
  id?: string
  formattedAddress?: string
  addressLine1?: string
  city?: string
  state?: string
  zipCode?: string
  latitude?: number
  longitude?: number
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  yearBuilt?: number
  propertyType?: string
  lotSize?: number
  ownerOccupied?: boolean
  owner?: {
    type?: string
  }
  lastSaleDate?: string
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

function scoreProperty(property: RentCastProperty) {
  let score = 45
  const reasons: string[] = []

  const currentYear = new Date().getFullYear()
  const propertyAge = property.yearBuilt ? currentYear - property.yearBuilt : null
  const yearsOwned = getYearsOwned(property.lastSaleDate)

  const ownerOccupied = property.ownerOccupied ?? null
  const isAbsenteeOwner = ownerOccupied === false
  const longTermOwner = (yearsOwned ?? 0) >= 15
  const seniorOwnerLikely = (yearsOwned ?? 0) >= 20 && ownerOccupied === true
  const likelyDistressed =
    isAbsenteeOwner || longTermOwner || (propertyAge ?? 0) >= 40

  const preforeclosure = false

  if (property.propertyType === 'Single Family') {
    score += 8
    reasons.push('Single-family property')
  }

  if ((property.bedrooms || 0) >= 3) {
    score += 4
    reasons.push('3+ bedrooms')
  }

  if ((property.bathrooms || 0) >= 2) {
    score += 4
    reasons.push('2+ bathrooms')
  }

  if ((property.squareFootage || 0) >= 1000) {
    score += 4
    reasons.push('1,000+ square feet')
  }

  if (isAbsenteeOwner) {
    score += 15
    reasons.push('Absentee owner')
  }

  if (longTermOwner) {
    score += 14
    reasons.push('Long-term owner')
  }

  if (seniorOwnerLikely) {
    score += 10
    reasons.push('Senior owner likely')
  }

  if ((propertyAge || 0) >= 40) {
    score += 10
    reasons.push('Older property')
  }

  if (property.owner?.type === 'Individual') {
    score += 5
    reasons.push('Individual owner')
  }

  if (likelyDistressed) {
    score += 8
    reasons.push('Possible distress signs')
  }

  if (preforeclosure) {
    score += 20
    reasons.push('Preforeclosure signal')
  }

  if (score > 100) score = 100

  let label = 'Okay'
  if (score >= 85) label = 'Hot Lead'
  else if (score >= 70) label = 'Strong Lead'
  else if (score >= 55) label = 'Good Lead'

  return {
    score,
    label,
    reasons,
    ownerOccupied,
    isAbsenteeOwner,
    yearsOwned,
    longTermOwner,
    seniorOwnerLikely,
    propertyAge,
    ownerType: property.owner?.type || null,
    likelyDistressed,
    preforeclosure,
    lastSaleDate: property.lastSaleDate || null,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const city = body.city?.trim()
    const state = body.state?.trim()?.toUpperCase()
    const limit = Math.min(Number(body.limit || 25), 100)

    if (!city || !state) {
      return NextResponse.json(
        { error: 'City and state are required.' },
        { status: 400 }
      )
    }

    const url = new URL('https://api.rentcast.io/v1/properties')
    url.searchParams.set('city', city)
    url.searchParams.set('state', state)
    url.searchParams.set('propertyType', 'Single Family')
    url.searchParams.set('limit', String(limit))

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Api-Key': process.env.RENTCAST_API_KEY || '',
      },
      cache: 'no-store',
    })

    const text = await res.text()

    if (!res.ok) {
      return NextResponse.json(
        { error: `RentCast error: ${text}` },
        { status: res.status }
      )
    }

    const properties = JSON.parse(text) as RentCastProperty[]

    const results = properties
      .map((property) => {
        const scored = scoreProperty(property)

        return {
          id: property.id || crypto.randomUUID(),
          address:
            property.formattedAddress ||
            [
              property.addressLine1,
              property.city,
              property.state,
              property.zipCode,
            ]
              .filter(Boolean)
              .join(', '),
          city: property.city || city,
          state: property.state || state,
          latitude: property.latitude ?? null,
          longitude: property.longitude ?? null,
          bedrooms: property.bedrooms ?? null,
          bathrooms: property.bathrooms ?? null,
          squareFootage: property.squareFootage ?? null,
          yearBuilt: property.yearBuilt ?? null,
          propertyType: property.propertyType ?? null,
          ownerOccupied: scored.ownerOccupied,
          isAbsenteeOwner: scored.isAbsenteeOwner,
          yearsOwned: scored.yearsOwned,
          longTermOwner: scored.longTermOwner,
          seniorOwnerLikely: scored.seniorOwnerLikely,
          propertyAge: scored.propertyAge,
          ownerType: scored.ownerType,
          likelyDistressed: scored.likelyDistressed,
          preforeclosure: scored.preforeclosure,
          lastSaleDate: scored.lastSaleDate,
          score: scored.score,
          label: scored.label,
          reasons: scored.reasons,
        }
      })
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong.' },
      { status: 500 }
    )
  }
}