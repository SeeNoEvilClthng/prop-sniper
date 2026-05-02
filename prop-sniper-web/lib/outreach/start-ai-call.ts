import { buildSellerCallScript } from '@/lib/ai/sellerCallScript'
import { createAdminClient } from '@/lib/supabase/admin'

type StartAiCallArgs = {
  leadId: string
  userId?: string | null
  reason?: string
}

export async function startAiCallForLead({
  leadId,
  userId = null,
  reason = 'Seller replied with interest.',
}: StartAiCallArgs) {
  const supabase = createAdminClient()
  const { data: lead, error } = await supabase
    .from('leads')
    .select('id, user_id, owner_name, property_address, address, phone, owner_phone, status')
    .eq('id', leadId)
    .single()

  if (error || !lead) {
    throw new Error('Lead not found')
  }

  if (userId && lead.user_id !== userId) {
    throw new Error('Lead not found')
  }

  if (lead.status === 'do_not_contact') {
    throw new Error('Lead is marked do not contact')
  }

  if (lead.status !== 'replied' && lead.status !== 'ai_calling') {
    throw new Error('AI calls can only start after a seller replies')
  }

  const phone = lead.phone || lead.owner_phone
  if (!phone) {
    throw new Error('Lead does not have a phone number')
  }

  const provider = process.env.VAPI_API_KEY
    ? 'vapi'
    : process.env.RETELL_API_KEY
      ? 'retell'
      : 'placeholder'

  const script = buildSellerCallScript({
    ownerName: lead.owner_name,
    propertyAddress: lead.property_address || lead.address,
  })

  const now = new Date().toISOString()

  await supabase
    .from('leads')
    .update({
      status: 'ai_calling',
      updated_at: now,
    })
    .eq('id', leadId)

  const { data: callLog, error: callLogError } = await supabase
    .from('call_logs')
    .insert({
      lead_id: leadId,
      user_id: lead.user_id,
      provider,
      direction: 'outbound',
      status: 'queued',
      ai_summary: `AI call queued. ${reason}`,
    })
    .select('id')
    .single()

  if (callLogError) {
    throw new Error(callLogError.message)
  }

  await supabase.from('contact_attempts').insert({
    lead_id: leadId,
    method: 'call',
    message: `AI call queued. ${reason}`,
    status: 'queued',
  })

  return {
    success: true,
    provider,
    leadId,
    callLogId: callLog?.id || null,
    script,
  }
}
