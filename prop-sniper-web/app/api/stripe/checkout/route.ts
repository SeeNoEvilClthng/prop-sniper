import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Checkout failed'
}

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('STRIPE ERROR:', error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
