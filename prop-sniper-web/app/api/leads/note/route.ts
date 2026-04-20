import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

type NoteBody = {
  leadId?: string
  note?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NoteBody

    if (!body.leadId || !body.note?.trim()) {
      return NextResponse.json(
        { error: 'leadId and note are required' },
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

    const { error } = await supabase.from('contact_attempts').insert({
      lead_id: body.leadId,
      method: 'note',
      message: body.note.trim(),
      status: 'logged',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to save note',
      },
      { status: 500 }
    )
  }
}
