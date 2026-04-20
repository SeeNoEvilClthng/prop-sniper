import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

type WorkflowBody = {
  leadId?: string
  status?: string | null
  followUpDate?: string | null
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WorkflowBody
    const { leadId, status, followUpDate } = body

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const updates: Record<string, string | null> = {}
    const eventMessages: string[] = []

    if (typeof status === 'string' && status.trim()) {
      updates.status = status.trim()
      eventMessages.push(`Status updated to ${status.trim()}.`)
    }

    if (followUpDate !== undefined) {
      updates.follow_up_date = followUpDate || null
      eventMessages.push(
        followUpDate
          ? `Follow-up scheduled for ${followUpDate}.`
          : 'Follow-up date cleared.'
      )
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No workflow updates provided' }, { status: 400 })
    }

    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (eventMessages.length > 0) {
      await supabase.from('contact_attempts').insert(
        eventMessages.map((message) => ({
          lead_id: leadId,
          method: 'workflow',
          message,
          status: 'logged',
        }))
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update lead workflow',
      },
      { status: 500 }
    )
  }
}
