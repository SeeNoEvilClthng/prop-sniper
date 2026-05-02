import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      sellerMessage,
      address,
      askingPrice,
      arv,
      repairs,
      maxOffer,
      tone = "calm",
    } = body;

    const response = await getOpenAIClient().responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `
You are an expert real estate wholesaler.
Write a short text reply to a seller.

Rules:
- Sound human, not robotic
- Keep it short
- No emojis
- No fake pressure
- No legal promises
- Goal is to keep the conversation moving
- Do not sound like an AI bot
          `.trim(),
        },
        {
          role: "user",
          content: `
Seller message: ${sellerMessage || "No message provided"}

Property:
- Address: ${address || "Unknown"}
- Asking price: ${askingPrice || "Unknown"}
- ARV: ${arv || "Unknown"}
- Repairs: ${repairs || "Unknown"}
- Max offer: ${maxOffer || "Unknown"}
- Tone: ${tone}

Write one reply text I can send back.
          `.trim(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      reply: response.output_text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate reply",
      },
      { status: 500 }
    );
  }
}
