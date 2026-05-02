import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId } = body as { customerId?: string };

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing Stripe customer ID." },
        { status: 400 }
      );
    }

    const portalSession = await getStripeClient().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("portal error:", error);
    return NextResponse.json(
      { error: "Unable to create portal session." },
      { status: 500 }
    );
  }
}
