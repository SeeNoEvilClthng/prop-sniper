"use client";

import { useState } from "react";

type Props = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  sqft?: number | null;
  estimatedValue?: number | null;
  beds?: number | null;
  baths?: number | null;
};

type AnalysisResult = {
  arv: number;
  repairs: number;
  maxOffer: number;
  spread: number;
  scoreLabel: string;
  scoreNumber: number;
  explanation: string;
  suggestedSellerText: string;
};

export default function DealAnalyzer({
  address = "",
  city = "",
  state = "",
  sqft = 0,
  estimatedValue = 0,
  beds = 0,
  baths = 0,
}: Props) {
  const [askingPrice, setAskingPrice] = useState("");
  const [compAverage, setCompAverage] = useState("");
  const [rehabLevel, setRehabLevel] = useState("medium");
  const [sellerMessage, setSellerMessage] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [aiReply, setAiReply] = useState("");
  const [dealExplanation, setDealExplanation] = useState("");
  const [buyerBlast, setBuyerBlast] = useState("");

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingBlast, setLoadingBlast] = useState(false);

  async function runAnalysis() {
    try {
      setLoadingAnalysis(true);

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sqft,
          estimatedValue,
          compAverage: Number(compAverage) || 0,
          askingPrice: Number(askingPrice) || 0,
          rehabLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.result);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  async function generateReply() {
    if (!result) {
      alert("Run the deal analysis first.");
      return;
    }

    try {
      setLoadingReply(true);

      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerMessage,
          address,
          askingPrice,
          arv: result.arv,
          repairs: result.repairs,
          maxOffer: result.maxOffer,
          tone: "calm",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reply generation failed");
      }

      setAiReply(data.reply || "");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Reply generation failed");
    } finally {
      setLoadingReply(false);
    }
  }

  async function generateExplanation() {
    if (!result) {
      alert("Run the deal analysis first.");
      return;
    }

    try {
      setLoadingExplain(true);

      const res = await fetch("/api/ai/explain-deal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          askingPrice,
          arv: result.arv,
          repairs: result.repairs,
          maxOffer: result.maxOffer,
          scoreLabel: result.scoreLabel,
          scoreNumber: result.scoreNumber,
          beds,
          baths,
          sqft,
          rehabLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Deal explanation failed");
      }

      setDealExplanation(data.explanation || "");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Deal explanation failed");
    } finally {
      setLoadingExplain(false);
    }
  }

  async function generateBuyerBlast() {
    if (!result) {
      alert("Run the deal analysis first.");
      return;
    }

    try {
      setLoadingBlast(true);

      const res = await fetch("/api/ai/buyer-blast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          city,
          state,
          arv: result.arv,
          repairs: result.repairs,
          ask: askingPrice,
          beds,
          baths,
          sqft,
          rehabLevel,
          notes: buyerNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Buyer blast failed");
      }

      setBuyerBlast(data.blast || "");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Buyer blast failed");
    } finally {
      setLoadingBlast(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    alert("Copied");
  }

  return (
    <div className="space-y-6 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">AI Deal Analyzer</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="number"
          placeholder="Asking Price"
          value={askingPrice}
          onChange={(e) => setAskingPrice(e.target.value)}
          className="rounded-xl border px-3 py-2"
        />

        <input
          type="number"
          placeholder="Comp Average"
          value={compAverage}
          onChange={(e) => setCompAverage(e.target.value)}
          className="rounded-xl border px-3 py-2"
        />

        <select
          value={rehabLevel}
          onChange={(e) => setRehabLevel(e.target.value)}
          className="rounded-xl border px-3 py-2"
        >
          <option value="light">Light Rehab</option>
          <option value="medium">Medium Rehab</option>
          <option value="heavy">Heavy Rehab</option>
        </select>
      </div>

      <button
        onClick={runAnalysis}
        disabled={loadingAnalysis}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loadingAnalysis ? "Running..." : "Analyze Deal"}
      </button>

      {result && (
        <div className="space-y-4 rounded-2xl border p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">ARV</p>
              <p className="font-semibold">${result.arv.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Repairs</p>
              <p className="font-semibold">${result.repairs.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Max Offer</p>
              <p className="font-semibold">${result.maxOffer.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Spread</p>
              <p className="font-semibold">${result.spread.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Score</p>
              <p className="font-semibold">
                {result.scoreLabel} ({result.scoreNumber}/100)
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Formula Summary</p>
            <p>{result.explanation}</p>
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-2xl border p-4">
        <h3 className="font-semibold">1. AI Seller Reply Generator</h3>
        <textarea
          placeholder="Paste what the seller said..."
          value={sellerMessage}
          onChange={(e) => setSellerMessage(e.target.value)}
          rows={4}
          className="w-full rounded-xl border p-3"
        />
        <button
          onClick={generateReply}
          disabled={loadingReply}
          className="rounded-xl bg-purple-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loadingReply ? "Generating..." : "Generate AI Reply"}
        </button>

        {aiReply && (
          <div className="space-y-2">
            <div className="rounded-xl bg-gray-50 p-3 text-sm">{aiReply}</div>
            <button
              onClick={() => copyText(aiReply)}
              className="rounded-xl bg-gray-800 px-4 py-2 text-white"
            >
              Copy Reply
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border p-4">
        <h3 className="font-semibold">2. AI Deal Explanation</h3>
        <button
          onClick={generateExplanation}
          disabled={loadingExplain}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loadingExplain ? "Generating..." : "Explain This Deal"}
        </button>

        {dealExplanation && (
          <div className="space-y-2">
            <div className="rounded-xl bg-gray-50 p-3 text-sm">
              {dealExplanation}
            </div>
            <button
              onClick={() => copyText(dealExplanation)}
              className="rounded-xl bg-gray-800 px-4 py-2 text-white"
            >
              Copy Explanation
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border p-4">
        <h3 className="font-semibold">3. AI Buyer Blast Generator</h3>
        <textarea
          placeholder="Optional buyer notes..."
          value={buyerNotes}
          onChange={(e) => setBuyerNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border p-3"
        />
        <button
          onClick={generateBuyerBlast}
          disabled={loadingBlast}
          className="rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loadingBlast ? "Generating..." : "Generate Buyer Blast"}
        </button>

        {buyerBlast && (
          <div className="space-y-2">
            <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm">
              {buyerBlast}
            </div>
            <button
              onClick={() => copyText(buyerBlast)}
              className="rounded-xl bg-gray-800 px-4 py-2 text-white"
            >
              Copy Buyer Blast
            </button>
          </div>
        )}
      </div>
    </div>
  );
}