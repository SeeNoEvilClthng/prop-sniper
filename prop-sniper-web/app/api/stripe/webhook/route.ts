import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.customer_email && session.subscription) {
      const { data: users } = await supabase.auth.admin.listUsers()

      const matchedUser = users.users.find(
        (u) => u.email?.toLowerCase() === session.customer_email?.toLowerCase()
      )

      if (matchedUser) {
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id

        await supabase.from('subscriptions').upsert({
          user_id: matchedUser.id,
          stripe_customer_id:
            typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan: 'pro',
        })
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription

    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        plan: 'free',
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}