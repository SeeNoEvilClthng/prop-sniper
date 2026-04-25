import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

type SendSmsBody = {
  leadId?: string
  to?: string
  message?: string
}

function getEnv(name: string) {
  return process.env[name]?.trim()
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendSmsBody
    const { leadId, to, message } = body

    if (!leadId || !to || !message?.trim()) {
      return NextResponse.json(
        { error: 'leadId, to, and message are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('id, address')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const accountSid = getEnv('TWILIO_ACCOUNT_SID')
    const authToken = getEnv('TWILIO_AUTH_TOKEN')
    const fromNumber = getEnv('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({
        success: true,
        preview: true,
        message: 'SMS provider not configured. Add Twilio environment variables to send from PropSniper.',
      })
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: to,
          Body: message.trim(),
        }),
      }
    )

    const payload = (await response.json()) as {
      sid?: string
      status?: string
      message?: string
      code?: number
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: payload.message || 'Failed to send SMS',
          providerCode: payload.code,
        },
        { status: 500 }
      )
    }

    await supabase.from('contact_attempts').insert({
      lead_id: leadId,
      method: 'sms',
      message: message.trim(),
      status: payload.status || 'sent',
    })

    return NextResponse.json({
      success: true,
      preview: false,
      sid: payload.sid,
      status: payload.status || 'sent',
      message: `Text sent for ${lead.address || 'lead'}.`,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      },
      { status: 500 }
    )
  }
}
