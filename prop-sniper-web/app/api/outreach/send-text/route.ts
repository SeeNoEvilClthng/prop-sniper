import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import {
  buildSafeFirstText,
  ensureUnsubscribeLanguage,
  isBlockedOutreachStatus,
  normalizePhoneNumber,
} from '@/lib/outreach/workflow'
import { sendSmsWithTwilio } from '@/lib/twilio'

type SendTextBody = {
  leadId?: string
  message?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendTextBody

    if (!body.leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', body.leadId)
      .eq('user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (isBlockedOutreachStatus(lead.status)) {
      return NextResponse.json(
        { error: 'This lead is blocked from outreach.' },
        { status: 409 }
      )
    }

    const toNumber = normalizePhoneNumber(lead.phone || lead.owner_phone)
    if (!toNumber) {
      return NextResponse.json({ error: 'Lead does not have a phone number.' }, { status: 400 })
    }

    const firstMessage = body.message?.trim() || buildSafeFirstText(lead.property_address || lead.address)
    const message =
      lead.status === 'text_sent' || lead.status === 'replied' || lead.status === 'ai_calling'
        ? ensureUnsubscribeLanguage(firstMessage)
        : firstMessage

    const result = await sendSmsWithTwilio(toNumber, message)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, providerCode: result.providerCode },
        { status: 500 }
      )
    }

    const now = new Date().toISOString()

    await supabase.from('outreach_messages').insert({
      lead_id: lead.id,
      user_id: user.id,
      direction: 'outbound',
      message_body: message,
      message_sid: result.sid || null,
      from_number: process.env.TWILIO_PHONE_NUMBER || null,
      to_number: toNumber,
      status: result.preview ? 'preview' : result.status || 'sent',
    })

    await supabase.from('contact_attempts').insert({
      lead_id: lead.id,
      method: 'sms',
      message,
      status: result.preview ? 'preview' : result.status || 'sent',
    })

    await supabase
      .from('leads')
      .update({
        status: 'text_sent',
        last_contact_at: now,
        updated_at: now,
      })
      .eq('id', lead.id)

    return NextResponse.json({
      success: true,
      preview: result.preview,
      message: result.preview
        ? result.message
        : `Text sent to ${toNumber}.`,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send text',
      },
      { status: 500 }
    )
  }
}
