import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      address,
      askingPrice,
      arv,
      repairs,
      maxOffer,
      scoreLabel,
      scoreNumber,
      beds,
      baths,
      sqft,
      rehabLevel,
    } = body;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `
You are a real estate investor assistant.
Explain deals in simple, practical language.

Rules:
- Be direct
- Keep it understandable
- Mention risk
- Mention upside
- Keep it under 140 words
          `.trim(),
        },
        {
          role: "user",
          content: `
Explain this real estate deal:

- Address: ${address || "Unknown"}
- Asking Price: ${askingPrice || "Unknown"}
- ARV: ${arv || "Unknown"}
- Repairs: ${repairs || "Unknown"}
- Max Offer: ${maxOffer || "Unknown"}
- Deal Score: ${scoreLabel || "Unknown"} (${scoreNumber || "Unknown"})
- Beds: ${beds || "Unknown"}
- Baths: ${baths || "Unknown"}
- Sqft: ${sqft || "Unknown"}
- Rehab Level: ${rehabLevel || "Unknown"}

Give me:
1. A short explanation
2. Biggest risk
3. Best next move
          `.trim(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      explanation: response.output_text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to explain deal",
      },
      { status: 500 }
    );
  }
}