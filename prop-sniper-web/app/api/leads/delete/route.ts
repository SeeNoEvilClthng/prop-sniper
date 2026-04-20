import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const id = formData.get('id')

  const supabase = await createClient()

  await supabase.from('leads').delete().eq('id', id)

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
