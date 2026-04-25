import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import {
  type FirstContactLead,
  generateFirstContactMessage,
} from '@/lib/first-contact-message'

type GenerateBody = {
  leadId?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody

    if (!body.leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
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
      .select('*')
      .eq('id', body.leadId)
      .eq('user_id', user.id)
      .single<FirstContactLead>()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const generated = await generateFirstContactMessage(lead)

    return NextResponse.json({
      success: true,
      preview: generated.preview,
      message: generated.message,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate first-contact message',
      },
      { status: 500 }
    )
  }
}
