import Stripe from 'stripe'

let cachedStripe: Stripe | null = null

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY in environment variables.')
  }

  if (!cachedStripe) {
    cachedStripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  return cachedStripe
}
