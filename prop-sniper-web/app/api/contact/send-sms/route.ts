import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { sendSmsWithTwilio } from '@/lib/twilio'

type SendSmsBody = {
  leadId?: string
  to?: string
  message?: string
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

    const result = await sendSmsWithTwilio(to, message.trim())

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          providerCode: result.providerCode,
        },
        { status: 500 }
      )
    }

    if (!result.preview) {
      await supabase.from('contact_attempts').insert({
        lead_id: leadId,
        method: 'sms',
        message: message.trim(),
        status: result.status || 'sent',
      })
    }

    return NextResponse.json({
      success: true,
      preview: result.preview,
      sid: result.sid,
      status: result.status || 'sent',
      message: result.preview
        ? result.message
        : `Text sent for ${lead.address || 'lead'}.`,
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
