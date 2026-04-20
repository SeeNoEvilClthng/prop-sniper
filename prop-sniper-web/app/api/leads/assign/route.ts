import { NextResponse } from 'next/server'

import {
  serializeLeadAssignment,
  type ParsedLeadAssignment,
} from '@/lib/lead-assignment'
import { createClient } from '@/lib/supabase/server'

type AssignBody = {
  leadId?: string
  assigneeId?: string
  assigneeEmail?: string
  assigneeRole?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AssignBody

    if (!body.leadId || !body.assigneeEmail?.trim()) {
      return NextResponse.json(
        { error: 'leadId and assigneeEmail are required' },
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

    const payload: ParsedLeadAssignment = {
      assigneeId: body.assigneeId || '',
      assigneeEmail: body.assigneeEmail.trim(),
      assigneeRole: body.assigneeRole?.trim() || 'user',
    }

    const { error } = await supabase.from('contact_attempts').insert({
      lead_id: body.leadId,
      method: 'assignment',
      status: 'logged',
      message: serializeLeadAssignment(payload),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to assign lead',
      },
      { status: 500 }
    )
  }
}
