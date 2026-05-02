import { createAdminClient } from '@/lib/supabase/admin'
import { startAiCallForLead } from '@/lib/outreach/start-ai-call'
import { classifySellerReply, normalizePhoneNumber } from '@/lib/outreach/workflow'

function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()
    const formData = await req.formData()

    const from = normalizePhoneNumber(String(formData.get('From') || ''))
    const to = normalizePhoneNumber(String(formData.get('To') || ''))
    const body = String(formData.get('Body') || '')
    const messageSid = String(formData.get('MessageSid') || '')

    if (!from || !body.trim()) {
      return xmlResponse('<Response></Response>')
    }

    const { data: matchingLead } = await supabase
      .from('leads')
      .select('id, user_id, status, phone, owner_phone')
      .or(`phone.eq.${from},owner_phone.eq.${from}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let leadId = matchingLead?.id || null
    let leadUserId = matchingLead?.user_id || null

    if (!leadId) {
      const { data: recentMessage } = await supabase
        .from('outreach_messages')
        .select('lead_id, user_id')
        .eq('to_number', from)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      leadId = recentMessage?.lead_id || null
      leadUserId = recentMessage?.user_id || null
    }

    if (!leadId) {
      return xmlResponse('<Response></Response>')
    }

    const replyType = classifySellerReply(body)
    const now = new Date().toISOString()

    await supabase.from('outreach_messages').insert({
      lead_id: leadId,
      user_id: leadUserId,
      direction: 'inbound',
      message_body: body.trim(),
      message_sid: messageSid || null,
      from_number: from,
      to_number: to || process.env.TWILIO_PHONE_NUMBER || null,
      status: 'received',
      replied_interest: replyType === 'interested',
    })

    await supabase.from('contact_attempts').insert({
      lead_id: leadId,
      method: 'sms',
      message: body.trim(),
      status: 'replied',
    })

    if (replyType === 'do_not_contact') {
      await supabase
        .from('leads')
        .update({
          status: 'do_not_contact',
          last_contact_at: now,
          updated_at: now,
        })
        .eq('id', leadId)

      return xmlResponse('<Response></Response>')
    }

    if (replyType === 'dead') {
      await supabase
        .from('leads')
        .update({
          status: 'dead',
          last_contact_at: now,
          updated_at: now,
        })
        .eq('id', leadId)

      return xmlResponse('<Response></Response>')
    }

    await supabase
      .from('leads')
      .update({
        status: 'replied',
        last_contact_at: now,
        updated_at: now,
      })
      .eq('id', leadId)

    if (replyType === 'interested') {
      await startAiCallForLead({
        leadId,
        reason: `Seller replied with interest: ${body.trim()}`,
      })
    }

    return xmlResponse('<Response></Response>')
  } catch {
    return xmlResponse('<Response></Response>')
  }
}
