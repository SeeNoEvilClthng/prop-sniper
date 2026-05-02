import { getOpenAIClient } from "@/lib/openai";

type LeadSummaryInput = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  owner_name?: string | null;
  is_absentee_owner?: boolean | null;
  long_term_owner?: boolean | null;
  senior_owner_likely?: boolean | null;
  likely_distressed?: boolean | null;
  owner_occupied?: boolean | null;
  property_age?: number | null;
  years_owned?: number | null;
  lead_score?: number | null;
  lead_rating?: string | null;
  lead_signals?: string | null;
  estimated_value?: number | null;
  target_offer?: number | null;
  estimated_repairs?: number | null;
  ai_analysis?: string | null;
  notes?: string | null;
};

export function getLeadSignals(input: LeadSummaryInput): string[] {
  const signals = new Set<string>();

  if (input.lead_signals) {
    for (const item of input.lead_signals.split(",")) {
      const trimmed = item.trim();
      if (trimmed) signals.add(trimmed);
    }
  }

  if (input.is_absentee_owner) signals.add("Absentee owner");
  if (input.long_term_owner) signals.add("Long-term owner");
  if (input.senior_owner_likely) signals.add("Senior owner likely");
  if (input.likely_distressed) signals.add("Possible distress");
  if (input.owner_occupied === false) signals.add("Non-owner occupied");
  if ((input.property_age ?? 0) >= 40) signals.add("Older property");
  if ((input.years_owned ?? 0) >= 15) signals.add("Long hold period");

  return Array.from(signals);
}

function buildFallbackSummary(input: LeadSummaryInput, signals: string[]) {
  const leadName =
    [input.address, input.city, input.state].filter(Boolean).join(", ") ||
    "This lead";

  const scoreLine =
    input.lead_score != null
      ? `${leadName} is currently scored ${input.lead_score}/100`
      : `${leadName} has incomplete scoring data`;

  const ratingLine = input.lead_rating
    ? `and is rated ${input.lead_rating.toLowerCase()}.`
    : ".";

  const signalLine = signals.length
    ? ` The biggest motivation signals are ${signals
        .slice(0, 3)
        .join(", ")
        .toLowerCase()}.`
    : " There are not many strong motivation signals yet, so this lead needs more validation.";

  const offerLine =
    input.target_offer != null || input.estimated_repairs != null
      ? ` The current underwriting points to ${
          input.target_offer != null
            ? `a target offer near $${Math.round(input.target_offer).toLocaleString()}`
            : "an incomplete target offer"
        }${
          input.estimated_repairs != null
            ? ` with repairs around $${Math.round(input.estimated_repairs).toLocaleString()}`
            : ""
        }.`
      : "";

  const noteLine = input.notes
    ? " Review the stored notes before outreach so the first conversation feels informed."
    : " The next best move is to verify condition, confirm motivation, and tighten the offer range.";

  return `${scoreLine} ${ratingLine}${signalLine}${offerLine}${noteLine}`;
}

export async function generateLeadSummary(input: LeadSummaryInput) {
  const signals = getLeadSignals(input);

  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackSummary(input, signals);
  }

  try {
    const prompt = `
You are an acquisitions copilot for a real-estate wholesaler.
Write a short lead summary in plain English for an internal dashboard.

Address: ${input.address ?? "Unknown"}
City: ${input.city ?? "Unknown"}
State: ${input.state ?? "Unknown"}
Status: ${input.status ?? "Unknown"}
Owner: ${input.owner_name ?? "Unknown"}
Lead score: ${input.lead_score ?? "Unknown"}
Lead rating: ${input.lead_rating ?? "Unknown"}
Signals: ${signals.join(", ") || "None"}
Estimated value: ${input.estimated_value ?? "Unknown"}
Target offer: ${input.target_offer ?? "Unknown"}
Estimated repairs: ${input.estimated_repairs ?? "Unknown"}
Existing AI analysis: ${input.ai_analysis ?? "None"}
Notes: ${input.notes ?? "None"}

Keep it to 3-5 sentences.
Explain why this lead may or may not be worth pursuing.
Mention the strongest motivation signals.
End with the next best action for the acquisition rep.
Do not use bullets.
`;

    const response = await getOpenAIClient().responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: prompt,
    });

    if (response.output_text?.trim()) {
      return response.output_text.trim();
    }
  } catch {}

  return buildFallbackSummary(input, signals);
}
