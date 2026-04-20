import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { serializeLeadTask, type ParsedLeadTask } from '@/lib/lead-tasks'

type CreateTaskBody = {
  leadId?: string
  title?: string
  dueDate?: string | null
  details?: string
}

type UpdateTaskBody = {
  taskId?: string
  status?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateTaskBody

    if (!body.leadId || !body.title?.trim()) {
      return NextResponse.json(
        { error: 'leadId and title are required' },
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

    const taskPayload: ParsedLeadTask = {
      title: body.title.trim(),
      dueDate: body.dueDate || null,
      details: body.details?.trim() || '',
    }

    const { error } = await supabase.from('contact_attempts').insert({
      lead_id: body.leadId,
      method: 'task',
      status: 'open',
      message: serializeLeadTask(taskPayload),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create task',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as UpdateTaskBody

    if (!body.taskId || !body.status?.trim()) {
      return NextResponse.json(
        { error: 'taskId and status are required' },
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

    const nextStatus = body.status.trim()
    if (!['open', 'completed'].includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { error } = await supabase
      .from('contact_attempts')
      .update({ status: nextStatus })
      .eq('id', body.taskId)
      .eq('method', 'task')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update task',
      },
      { status: 500 }
    )
  }
}
