import OpenAI from 'openai'

type PropertyRecord = {
  squareFootage?: number
  bedrooms?: number
  bathrooms?: number
  yearBuilt?: number
  propertyType?: string
  ownerOccupied?: boolean
  owner?: {
    type?: string
    names?: string[]
  }
}

type ComparableLike = {
  price?: number
  soldPrice?: number
  closePrice?: number
}

type ValueResponseLike = {
  price?: number
  comparables?: ComparableLike[]
  saleComparables?: ComparableLike[]
  comps?: ComparableLike[]
}

type ResponseContentItem = {
  text?: string
}

type ResponseOutputItem = {
  content?: ResponseContentItem[]
}

type OpenAIResponseLike = {
  output_text?: string
  output?: ResponseOutputItem[]
}

export type DealAnalysisInput = {
  fullAddress: string
  currentEstimatedValue?: number | null
  currentBedrooms?: number | null
  currentBathrooms?: number | null
  currentSquareFootage?: number | null
  notes?: string | null
  rehabLevel?: 'light' | 'medium' | 'heavy'
}

export type DealAnalysisResult = {
  arv: number | null
  estimatedRepairs: number | null
  targetOffer: number | null
  valueConfidence: 'low' | 'medium' | 'high'
  compCount: number
  aiAnalysis: string
  rehabLevel: 'light' | 'medium' | 'heavy'
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | null
}

function inferRehabLevel(
  notes?: string | null,
  fallback: 'light' | 'medium' | 'heavy' = 'medium'
): 'light' | 'medium' | 'heavy' {
  const text = (notes || '').toLowerCase()

  if (
    text.includes('full gut') ||
    text.includes('foundation') ||
    text.includes('fire') ||
    text.includes('severe') ||
    text.includes('heavy rehab')
  ) {
    return 'heavy'
  }

  if (
    text.includes('paint') ||
    text.includes('cosmetic') ||
    text.includes('carpet') ||
    text.includes('minor') ||
    text.includes('light rehab')
  ) {
    return 'light'
  }

  if (
    text.includes('roof') ||
    text.includes('kitchen') ||
    text.includes('bathroom') ||
    text.includes('flooring') ||
    text.includes('medium rehab')
  ) {
    return 'medium'
  }

  return fallback
}

function estimateRepairs(
  sqft: number | null,
  rehabLevel: 'light' | 'medium' | 'heavy'
) {
  const size = sqft || 1500
  const perSqft =
    rehabLevel === 'light' ? 15 :
    rehabLevel === 'medium' ? 30 :
    50

  return Math.round(size * perSqft)
}

function median(values: number[]) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

function pickCompPrices(valueData: ValueResponseLike): number[] {
  const raw =
    valueData.comparables ||
    valueData.saleComparables ||
    valueData.comps ||
    []

  return raw
    .map((c) => c.price ?? c.soldPrice ?? c.closePrice ?? null)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
}

function getTargetOffer(
  arv: number,
  repairs: number,
  assignmentFee = 10000,
  investorPercent = 0.7,
  closingCosts = 5000
) {
  return Math.round(arv * investorPercent - repairs - assignmentFee - closingCosts)
}

function getResponseText(response: OpenAIResponseLike) {
  return response.output_text || response.output?.[0]?.content?.[0]?.text || ''
}

async function fetchPropertyRecord(address: string): Promise<PropertyRecord | null> {
  if (!process.env.RENTCAST_API_KEY) return null

  const url = new URL('https://api.rentcast.io/v1/properties')
  url.searchParams.set('address', address)

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Api-Key': process.env.RENTCAST_API_KEY,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  const data = (await res.json()) as PropertyRecord[]
  return data?.[0] || null
}

async function fetchValueEstimate(address: string): Promise<ValueResponseLike | null> {
  if (!process.env.RENTCAST_API_KEY) return null

  const url = new URL('https://api.rentcast.io/v1/avm/value')
  url.searchParams.set('address', address)

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Api-Key': process.env.RENTCAST_API_KEY,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  return (await res.json()) as ValueResponseLike
}

async function generateAiAnalysis(args: {
  address: string
  arv: number | null
  repairs: number | null
  targetOffer: number | null
  confidence: 'low' | 'medium' | 'high'
  compCount: number
  rehabLevel: 'light' | 'medium' | 'heavy'
  bedrooms: number | null
  bathrooms: number | null
  squareFootage: number | null
}) {
  if (!process.env.OPENAI_API_KEY) {
    return `ARV: ${args.arv ?? 'N/A'}. Repairs: ${args.repairs ?? 'N/A'}. Target Offer: ${args.targetOffer ?? 'N/A'}. Confidence: ${args.confidence}.`
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = `
You are a real-estate deal analyst for wholesalers.
Write a short analysis in plain English.

Address: ${args.address}
ARV: ${args.arv ?? 'N/A'}
Estimated Repairs: ${args.repairs ?? 'N/A'}
Target Offer: ${args.targetOffer ?? 'N/A'}
Value Confidence: ${args.confidence}
Comparable Count: ${args.compCount}
Rehab Level: ${args.rehabLevel}
Beds: ${args.bedrooms ?? 'N/A'}
Baths: ${args.bathrooms ?? 'N/A'}
Square Footage: ${args.squareFootage ?? 'N/A'}

Keep it to 4-6 sentences.
Explain what looks strong, what is uncertain, and the likely next move.
Do not use bullets.
`

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
      input: prompt,
    })

    const text = getResponseText(response as OpenAIResponseLike)

    return text || `ARV: ${args.arv ?? 'N/A'}. Repairs: ${args.repairs ?? 'N/A'}. Target Offer: ${args.targetOffer ?? 'N/A'}. Confidence: ${args.confidence}.`
  } catch {
    return `ARV: ${args.arv ?? 'N/A'}. Repairs: ${args.repairs ?? 'N/A'}. Target Offer: ${args.targetOffer ?? 'N/A'}. Confidence: ${args.confidence}.`
  }
}

export async function analyzeDeal(input: DealAnalysisInput): Promise<DealAnalysisResult> {
  const rehabLevel = inferRehabLevel(input.notes, input.rehabLevel || 'medium')

  const [property, valueData] = await Promise.all([
    fetchPropertyRecord(input.fullAddress),
    fetchValueEstimate(input.fullAddress),
  ])

  const squareFootage =
    property?.squareFootage ??
    input.currentSquareFootage ??
    null

  const bedrooms =
    property?.bedrooms ??
    input.currentBedrooms ??
    null

  const bathrooms =
    property?.bathrooms ??
    input.currentBathrooms ??
    null

  const compPrices = valueData ? pickCompPrices(valueData) : []
  const compMedian = median(compPrices)

  const arv =
    valueData?.price ??
    compMedian ??
    input.currentEstimatedValue ??
    null

  const compCount = compPrices.length

  const valueConfidence: 'low' | 'medium' | 'high' =
    compCount >= 5 ? 'high' :
    compCount >= 2 ? 'medium' :
    arv ? 'low' : 'low'

  const estimatedRepairs = arv ? estimateRepairs(squareFootage, rehabLevel) : null
  const targetOffer =
    arv && estimatedRepairs != null
      ? getTargetOffer(arv, estimatedRepairs)
      : null

  const aiAnalysis = await generateAiAnalysis({
    address: input.fullAddress,
    arv,
    repairs: estimatedRepairs,
    targetOffer,
    confidence: valueConfidence,
    compCount,
    rehabLevel,
    bedrooms,
    bathrooms,
    squareFootage,
  })

  return {
    arv,
    estimatedRepairs,
    targetOffer,
    valueConfidence,
    compCount,
    aiAnalysis,
    rehabLevel,
    squareFootage,
    bedrooms,
    bathrooms,
  }
}
