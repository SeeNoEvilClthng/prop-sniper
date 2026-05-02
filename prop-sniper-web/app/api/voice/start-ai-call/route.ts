import { NextResponse } from 'next/server'

import { startAiCallForLead } from '@/lib/outreach/start-ai-call'
import { createClient } from '@/lib/supabase/server'

type StartAiCallBody = {
  lead_id?: string
  leadId?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as StartAiCallBody
    const leadId = body.lead_id || body.leadId

    if (!leadId) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const started = await startAiCallForLead({
      leadId,
      userId: user.id,
    })

    return NextResponse.json(started)
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to start AI call',
      },
      { status: 500 }
    )
  }
}
