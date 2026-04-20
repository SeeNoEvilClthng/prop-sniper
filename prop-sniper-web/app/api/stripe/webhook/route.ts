import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("checkout.session.completed", {
          customer: session.customer,
          subscription: session.subscription,
          email: session.customer_details?.email,
        });

        // Save to your DB here:
        // - stripe_customer_id
        // - stripe_subscription_id
        // - user email
        // - subscription status
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("subscription changed", {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          trial_end: subscription.trial_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        // Update DB here:
        // status could be trialing, active, past_due, canceled, etc.
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("subscription deleted", {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
        });

        // Revoke access in DB here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}