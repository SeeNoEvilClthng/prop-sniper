import { NextRequest, NextResponse } from 'next/server'

type AnyRecord = Record<string, any>

function buildFullAddress(address: string, city?: string | null, state?: string | null, zipCode?: string | null) {
  return `${address}, ${city || ''}, ${state || ''} ${zipCode || ''}`
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim()
}

function isUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function flattenPhotoCandidates(input: any): string[] {
  const results: string[] = []

  const visit = (value: any) => {
    if (!value) return

    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }

    if (typeof value === 'string') {
      if (isUrl(value)) results.push(value)
      return
    }

    if (typeof value === 'object') {
      const directKeys = [
        'url',
        'href',
        'src',
        'imageUrl',
        'photoUrl',
        'thumbnailUrl',
        'largeUrl',
        'mediumUrl',
        'smallUrl',
      ]

      for (const key of directKeys) {
        if (isUrl(value[key])) results.push(value[key])
      }

      for (const nested of Object.values(value)) {
        if (typeof nested === 'object' || typeof nested === 'string') {
          visit(nested)
        }
      }
    }
  }

  visit(input)
  return results
}

function extractPhotosFromListing(listing: AnyRecord | null | undefined): string[] {
  if (!listing) return []

  const candidateFields = [
    listing.photos,
    listing.images,
    listing.imageUrls,
    listing.photoUrls,
    listing.media,
    listing.media?.photos,
    listing.media?.images,
    listing.gallery,
    listing.galleryPhotos,
    listing.listingPhotos,
    listing.propertyPhotos,
  ]

  const urls = candidateFields.flatMap((field) => flattenPhotoCandidates(field))

  return Array.from(new Set(urls)).filter(isUrl)
}

async function fetchListingPhotos(endpoint: string, fullAddress: string) {
  if (!process.env.RENTCAST_API_KEY) {
    return { source: endpoint, photos: [] as string[], ok: false }
  }

  try {
    const url = new URL(endpoint)
    url.searchParams.set('address', fullAddress)
    url.searchParams.set('limit', '1')

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Api-Key': process.env.RENTCAST_API_KEY,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return { source: endpoint, photos: [] as string[], ok: false }
    }

    const data = await res.json()
    const listing = Array.isArray(data) ? data[0] : data?.listings?.[0] || data?.results?.[0] || data
    const photos = extractPhotosFromListing(listing)

    return { source: endpoint, photos, ok: true }
  } catch {
    return { source: endpoint, photos: [] as string[], ok: false }
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')
  const city = request.nextUrl.searchParams.get('city')
  const state = request.nextUrl.searchParams.get('state')
  const zipCode = request.nextUrl.searchParams.get('zipCode')

  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  }

  const fullAddress = buildFullAddress(address, city, state, zipCode)

  const [saleResult, rentalResult] = await Promise.all([
    fetchListingPhotos('https://api.rentcast.io/v1/listings/sale', fullAddress),
    fetchListingPhotos('https://api.rentcast.io/v1/listings/rental/long-term', fullAddress),
  ])

  const merged = Array.from(new Set([...saleResult.photos, ...rentalResult.photos]))

  return NextResponse.json({
    fullAddress,
    photos: merged.slice(0, 12),
    sources: {
      sale: saleResult.photos.length,
      rental: rentalResult.photos.length,
    },
  })
}