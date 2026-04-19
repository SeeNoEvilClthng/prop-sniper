export type RehabLevel = "light" | "medium" | "heavy";

export type DealInput = {
  sqft?: number | null;
  estimatedValue?: number | null;
  compAverage?: number | null;
  askingPrice?: number | null;
  rehabLevel?: RehabLevel | null;
};

export type DealAnalysis = {
  arv: number;
  repairs: number;
  maxOffer: number;
  spread: number;
  scoreLabel: "great deal" | "solid deal" | "borderline" | "bad deal";
  scoreNumber: number;
  explanation: string;
  suggestedSellerText: string;
};

function safeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getRepairCostPerSqft(rehabLevel: RehabLevel): number {
  if (rehabLevel === "light") return 15;
  if (rehabLevel === "medium") return 30;
  return 50;
}

function getSuggestedSellerText(scoreLabel: DealAnalysis["scoreLabel"], maxOffer: number) {
  if (scoreLabel === "great deal") {
    return `Hi, I’m interested in your property. If the condition makes sense after a walkthrough, I could be around $${Math.round(maxOffer).toLocaleString()} cash and close fast. Are you open to talking?`;
  }

  if (scoreLabel === "solid deal") {
    return `Hi, I’m interested in your property and can make a serious cash offer. Based on the condition and area, I may be around $${Math.round(maxOffer).toLocaleString()}. Would you be open to discussing it?`;
  }

  if (scoreLabel === "borderline") {
    return `Hi, I’m still interested in the property, but I’d need the numbers to make sense after repairs. Would you be open to a quick conversation about condition and price?`;
  }

  return `Hi, I looked over the area and the numbers are tight for me right now, but I’d still be open to talking if you have flexibility on price.`;
}

export function analyzeDeal(input: DealInput): DealAnalysis {
  const sqft = safeNumber(input.sqft, 0);
  const estimatedValue = safeNumber(input.estimatedValue, 0);
  const compAverage = safeNumber(input.compAverage, 0);
  const askingPrice = safeNumber(input.askingPrice, 0);
  const rehabLevel: RehabLevel = input.rehabLevel ?? "medium";

  const arvBase = compAverage > 0 ? compAverage : estimatedValue;
  const arv = Math.round(arvBase);

  const repairCostPerSqft = getRepairCostPerSqft(rehabLevel);
  const repairs = Math.round(sqft * repairCostPerSqft);

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

  let scoreLabel: DealAnalysis["scoreLabel"] = "bad deal";
  if (scoreNumber >= 85) scoreLabel = "great deal";
  else if (scoreNumber >= 70) scoreLabel = "solid deal";
  else if (scoreNumber >= 50) scoreLabel = "borderline";

  const explanation =
    scoreLabel === "great deal"
      ? "This looks strong based on the ARV, repair estimate, and offer spread."
      : scoreLabel === "solid deal"
      ? "This deal has room, but you still need to verify comps and repair costs."
      : scoreLabel === "borderline"
      ? "This one is close. It may work only if repairs are lower or price comes down."
      : "The numbers look too tight right now unless the seller drops the price or the rehab is lighter than expected.";

  return {
    arv,
    repairs,
    maxOffer,
    spread,
    scoreLabel,
    scoreNumber,
    explanation,
    suggestedSellerText: getSuggestedSellerText(scoreLabel, maxOffer),
  };
}