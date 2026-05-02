import { NextResponse } from 'next/server'

import { scoreLead } from '@/lib/scoring/scoreLead'
import { createAdminClient } from '@/lib/supabase/admin'

type CallResultBody = {
  lead_id?: string
  transcript?: string
  condition?: string
  motivation?: string
  timeline?: string
  asking_price?: number | null
  ai_summary?: string
  wants_callback?: boolean
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CallResultBody

    if (!body.lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', body.lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const scored = scoreLead({
      motivation: body.motivation,
      condition: body.condition,
      timeline: body.timeline,
      askingPrice: body.asking_price,
      aiSummary: body.ai_summary,
      phone: lead.phone || lead.owner_phone,
      email: lead.email || lead.owner_email,
    })

    const now = new Date().toISOString()
    const nextStatus = body.wants_callback ? 'appointment_booked' : scored.status
    const mergedNotes = [lead.notes, body.transcript].filter(Boolean).join('\n\n')

    await supabase
      .from('leads')
      .update({
        motivation_score: scored.motivationScore,
        condition_score: scored.conditionScore,
        timeline_score: scored.timelineScore,
        price_score: scored.priceScore,
        total_score: scored.totalScore,
        lead_score: scored.totalScore,
        ai_summary: body.ai_summary || lead.ai_summary || null,
        ai_analysis: body.ai_summary || lead.ai_analysis || null,
        notes: mergedNotes || null,
        status: nextStatus,
        last_contact_at: now,
        updated_at: now,
      })
      .eq('id', body.lead_id)

    await supabase.from('call_logs').insert({
      lead_id: body.lead_id,
      user_id: lead.user_id || null,
      provider: process.env.VAPI_API_KEY ? 'vapi' : process.env.RETELL_API_KEY ? 'retell' : 'placeholder',
      direction: 'outbound',
      status: 'completed',
      transcript: body.transcript || null,
      condition: body.condition || null,
      motivation: body.motivation || null,
      timeline: body.timeline || null,
      asking_price: body.asking_price ?? null,
      ai_summary: body.ai_summary || null,
      wants_callback: Boolean(body.wants_callback),
      updated_at: now,
    })

    await supabase.from('contact_attempts').insert({
      lead_id: body.lead_id,
      method: 'call',
      message: body.ai_summary || 'AI qualification call completed.',
      status: 'completed',
    })

    if (scored.status === 'qualified_hot' || body.wants_callback) {
      await supabase.from('appointments').insert({
        lead_id: body.lead_id,
        user_id: lead.user_id || null,
        contact_name: lead.owner_name || null,
        phone: lead.phone || lead.owner_phone || null,
        status: body.wants_callback ? 'callback_requested' : 'needs_scheduling',
        notes: body.ai_summary || 'AI qualification indicates manual follow-up is needed.',
        updated_at: now,
      })
    }

    return NextResponse.json({
      success: true,
      total_score: scored.totalScore,
      status: nextStatus,
      appointment_created: scored.status === 'qualified_hot' || Boolean(body.wants_callback),
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save call result',
      },
      { status: 500 }
    )
  }
}
