import { NextResponse } from 'next/server'

import {
  type FirstContactLead,
  generateFirstContactMessage,
} from '@/lib/first-contact-message'
import { createClient } from '@/lib/supabase/server'
import { sendSmsWithTwilio } from '@/lib/twilio'

type CampaignBody = {
  leadIds?: string[]
}

type CampaignLead = FirstContactLead & {
  owner_phone?: string | null
}

const MAX_BATCH_SIZE = 25

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CampaignBody
    const leadIds = Array.isArray(body.leadIds) ? [...new Set(body.leadIds.filter(Boolean))] : []

    if (leadIds.length === 0) {
      return NextResponse.json({ error: 'At least one lead must be selected' }, { status: 400 })
    }

    if (leadIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          error: `Campaigns are limited to ${MAX_BATCH_SIZE} leads at a time.`,
        },
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

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .in('id', leadIds)

    const campaignLeads = (leads || []) as CampaignLead[]

    if (campaignLeads.length === 0) {
      return NextResponse.json({ error: 'No leads found for campaign' }, { status: 404 })
    }

    const results: Array<{
      leadId: string
      address: string
      phone: string
      success: boolean
      preview: boolean
      message: string
      generatedText?: string
    }> = []

    for (const lead of campaignLeads) {
      const phone = lead.owner_phone?.trim()

      if (!phone) {
        results.push({
          leadId: lead.id,
          address: lead.address || 'Unknown property',
          phone: '—',
          success: false,
          preview: false,
          message: 'No owner phone saved for this lead.',
        })
        continue
      }

      const generated = await generateFirstContactMessage(lead)
      const sent = await sendSmsWithTwilio(phone, generated.message)

      if (sent.success && !sent.preview) {
        await supabase.from('contact_attempts').insert({
          lead_id: lead.id,
          method: 'sms',
          message: generated.message,
          status: sent.status || 'sent',
        })
      }

      results.push({
        leadId: lead.id,
        address: lead.address || 'Unknown property',
        phone,
        success: sent.success,
        preview: sent.preview,
        message: sent.success
          ? sent.preview
            ? 'Preview generated. Twilio is not configured yet.'
            : 'First-contact text sent.'
          : sent.message,
        generatedText: generated.message,
      })
    }

    const sentCount = results.filter((item) => item.success && !item.preview).length
    const previewCount = results.filter((item) => item.preview).length
    const failedCount = results.filter((item) => !item.success).length

    return NextResponse.json({
      success: true,
      sentCount,
      previewCount,
      failedCount,
      results,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to run first-contact campaign',
      },
      { status: 500 }
    )
  }
}
