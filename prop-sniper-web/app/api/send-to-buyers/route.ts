import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getBuyerMatch } from '@/lib/buyer-matching'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { leadId } = await req.json()

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { data: investors } = await supabase
      .from('investors')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)

    const validBuyers =
      (investors || [])
        .filter((inv) => inv.has_contact && inv.email)
        .map((inv) => ({
          investor: inv,
          match: getBuyerMatch(lead, inv),
        }))
        .filter((item) => item.match.score >= 50)
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 10)

    const emails = validBuyers
      .map((b) => b.investor.email)
      .filter(Boolean)

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No buyers to send to' }, { status: 400 })
    }

    const dealText = `
🔥 New Deal Available 🔥

Address: ${lead.address}
City: ${lead.city}, ${lead.state}

Price: ${lead.estimated_value ? `$${Number(lead.estimated_value).toLocaleString()}` : 'TBD'}
Beds: ${lead.bedrooms || '?'}
Baths: ${lead.bathrooms || '?'}

Lead Score: ${lead.lead_score || 'N/A'}

Notes:
${lead.notes || 'No notes'}

📩 Reply for details or to secure this deal.
    `

    await resend.emails.send({
      from: 'Deals <onboarding@resend.dev>',
      to: emails,
      subject: `🔥 Deal: ${lead.address}`,
      text: dealText,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}