import { NextResponse } from "next/server";

type RehabLevel = "light" | "medium" | "heavy";

function safeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getRepairCostPerSqft(rehabLevel: RehabLevel): number {
  if (rehabLevel === "light") return 15;
  if (rehabLevel === "medium") return 30;
  return 50;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sqft = safeNumber(body.sqft, 0);
    const estimatedValue = safeNumber(body.estimatedValue, 0);
    const compAverage = safeNumber(body.compAverage, 0);
    const askingPrice = safeNumber(body.askingPrice, 0);
    const rehabLevel: RehabLevel = body.rehabLevel ?? "medium";

    const arvBase = compAverage > 0 ? compAverage : estimatedValue;
    const arv = Math.round(arvBase);

    const repairs = Math.round(sqft * getRepairCostPerSqft(rehabLevel));
    const maxOffer = Math.round(arv * 0.7 - repairs);
    const spread = Math.round(maxOffer - askingPrice);

    let scoreNumber = 0;

    if (arv > 0 && askingPrice > 0) {
      const marginPercent = ((maxOffer - askingPrice) / arv) * 100;

      if (marginPercent >= 8) scoreNumber = 90;
      else if (marginPercent >= 3) scoreNumber = 75;
      else if (marginPercent >= -3) scoreNumber = 55;
      else scoreNumber = 30;
    }

    let scoreLabel = "bad deal";
    if (scoreNumber >= 85) scoreLabel = "great deal";
    else if (scoreNumber >= 70) scoreLabel = "solid deal";
    else if (scoreNumber >= 50) scoreLabel = "borderline";

    let explanation =
      "The numbers look too tight right now unless the seller drops the price or the rehab is lighter than expected.";

    if (scoreLabel === "great deal") {
      explanation =
        "This looks strong based on the ARV, repair estimate, and offer spread.";
    } else if (scoreLabel === "solid deal") {
      explanation =
        "This deal has room, but you still need to verify comps and repair costs.";
    } else if (scoreLabel === "borderline") {
      explanation =
        "This one is close. It may work only if repairs are lower or price comes down.";
    }

    return NextResponse.json({
      success: true,
      result: {
        arv,
        repairs,
        maxOffer,
        spread,
        scoreLabel,
        scoreNumber,
        explanation,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze deal",
      },
      { status: 500 }
    );
  }
}