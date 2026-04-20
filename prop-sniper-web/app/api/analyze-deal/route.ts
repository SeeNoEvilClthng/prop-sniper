import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDeal } from '@/lib/deal-analysis'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { leadId, rehabLevel } = await req.json()

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const fullAddress = `${lead.address || ''}, ${lead.city || ''}, ${lead.state || ''} ${lead.zip_code || ''}`.trim()

    const analysis = await analyzeDeal({
      fullAddress,
      currentEstimatedValue: lead.estimated_value,
      currentBedrooms: lead.bedrooms,
      currentBathrooms: lead.bathrooms,
      currentSquareFootage: lead.square_footage,
      notes: lead.notes,
      rehabLevel: rehabLevel || lead.rehab_level || 'medium',
    })

    const { error: updateError } = await supabase
      .from('leads')
      .update({
        arv: analysis.arv,
        estimated_repairs: analysis.estimatedRepairs,
        target_offer: analysis.targetOffer,
        value_confidence: analysis.valueConfidence,
        comp_count: analysis.compCount,
        ai_analysis: analysis.aiAnalysis,
        rehab_level: analysis.rehabLevel,
        square_footage: analysis.squareFootage,
        bedrooms: lead.bedrooms ?? analysis.bedrooms,
        bathrooms: lead.bathrooms ?? analysis.bathrooms,
      })
      .eq('id', leadId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
