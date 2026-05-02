import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getBuyerMatch } from '@/lib/buyer-matching'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

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

    const summary = {
      recipientCount: emails.length,
      topMatches: validBuyers.slice(0, 5).map((item) => ({
        id: item.investor.id,
        company_name: item.investor.company_name,
        contact_name: item.investor.contact_name,
        email: item.investor.email,
        score: item.match.score,
        label: item.match.label,
        reasons: item.match.reasons,
      })),
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: true,
        preview: true,
        message: 'Preview generated. Add RESEND_API_KEY to send emails.',
        ...summary,
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Deals <onboarding@resend.dev>',
      to: emails,
      subject: `🔥 Deal: ${lead.address}`,
      text: dealText,
    })

    return NextResponse.json({
      success: true,
      preview: false,
      message: `Deal sent to ${emails.length} buyers.`,
      ...summary,
    })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
