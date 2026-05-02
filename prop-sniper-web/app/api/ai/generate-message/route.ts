import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      address,
      condition,
      askingPrice,
      arv,
      situation, // optional: "motivated seller", "not interested", etc.
    } = body;

    const prompt = `
You are a real estate wholesaler texting a property owner.

Write a SHORT, natural, human-sounding text message.

Details:
- Property: ${address}
- Asking Price: ${askingPrice || "unknown"}
- ARV: ${arv || "unknown"}
- Condition: ${condition || "unknown"}
- Situation: ${situation || "first contact"}

Rules:
- Keep it casual and not robotic
- No long paragraphs
- No emojis
- Sound like a real person texting
- Goal: get a reply, not close the deal
`;

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert real estate wholesaler." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const message = response.choices[0]?.message?.content || "";

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AI failed",
      },
      { status: 500 }
    );
  }
}
