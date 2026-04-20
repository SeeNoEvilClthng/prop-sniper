import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_STARTER_PRICE_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables.");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, company } = body as {
      fullName?: string;
      email?: string;
      company?: string;
    };

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_STARTER_PRICE_ID in environment variables." },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL in environment variables." },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          fullName,
          company: company || "",
          plan: "starter",
        },
      },
      metadata: {
        fullName,
        company: company || "",
        plan: "starter",
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe checkout trial error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session.",
      },
      { status: 500 }
    );
  }
}