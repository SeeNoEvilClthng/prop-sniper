"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [scanProgress, setScanProgress] = useState(0);
  const [animatedValues, setAnimatedValues] = useState({
    arv: 0,
    repairs: 0,
    maxOffer: 0,
    spread: 0,
    scoreNumber: 0,
  });

  const scoreTone = useMemo(() => {
    if (!result) {
      return {
        glow: "from-violet-500/30 via-fuchsia-500/10 to-indigo-500/20",
        chip: "bg-slate-500/15 text-slate-200 ring-slate-400/30",
      };
    }

    if (result.scoreNumber >= 85) {
      return {
        glow: "from-emerald-500/30 via-lime-500/10 to-emerald-400/20",
        chip: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
      };
    }

    if (result.scoreNumber >= 70) {
      return {
        glow: "from-amber-500/30 via-yellow-500/10 to-orange-400/20",
        chip: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
      };
    }

    return {
      glow: "from-rose-500/30 via-pink-500/10 to-fuchsia-400/20",
      chip: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
    };
  }, [result]);

  useEffect(() => {
    if (!loadingAnalysis) {
      setScanProgress(0);
      return;
    }

    const steps = [14, 28, 42, 57, 73, 88, 97];
    let index = 0;

    const interval = window.setInterval(() => {
      setScanProgress((current) => {
        if (current >= 97) return current;
        const next = steps[index] ?? 97;
        index += 1;
        return next;
      });
    }, 220);

    return () => window.clearInterval(interval);
  }, [loadingAnalysis]);

  useEffect(() => {
    if (!result) return;

    const duration = 820;
    const start = performance.now();

    const frame = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        arv: Math.round(result.arv * eased),
        repairs: Math.round(result.repairs * eased),
        maxOffer: Math.round(result.maxOffer * eased),
        spread: Math.round(result.spread * eased),
        scoreNumber: Math.round(result.scoreNumber * eased),
      });

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      }
    };

    window.requestAnimationFrame(frame);
  }, [result]);

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

      setScanProgress(100);
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

  function formatMoney(value: number) {
    return `$${value.toLocaleString()}`;
  }

  return (
    <div className="luxe-panel edge-glow futuristic-grid overflow-hidden rounded-[28px] p-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-violet-200/80">
            Deal Scanner
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            AI Deal Analyzer
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Scan a property like a sniper desk. Run underwriting, reveal the
            spread, and spin up seller or buyer messaging from the same screen.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
            ARV
          </span>
          <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-violet-200">
            Repairs
          </span>
          <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-fuchsia-200">
            Profit Window
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="number"
          placeholder="Asking Price"
          value={askingPrice}
          onChange={(e) => setAskingPrice(e.target.value)}
          className="glass-input rounded-2xl px-4 py-3 text-white placeholder:text-slate-500"
        />

        <input
          type="number"
          placeholder="Comp Average"
          value={compAverage}
          onChange={(e) => setCompAverage(e.target.value)}
          className="glass-input rounded-2xl px-4 py-3 text-white placeholder:text-slate-500"
        />

        <select
          value={rehabLevel}
          onChange={(e) => setRehabLevel(e.target.value)}
          className="glass-input rounded-2xl px-4 py-3 text-white"
        >
          <option value="light">Light Rehab</option>
          <option value="medium">Medium Rehab</option>
          <option value="heavy">Heavy Rehab</option>
        </select>
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <button
          onClick={runAnalysis}
          disabled={loadingAnalysis}
          className="neon-button rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {loadingAnalysis ? "Scanning deal..." : "Analyze Deal"}
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.26em] text-slate-400">
          <span>Sniper Rating</span>
          <div className="metric-bar relative h-2 w-40 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${scoreTone.glow}`}
              style={{ width: `${Math.max(animatedValues.scoreNumber, result?.scoreNumber ?? 0)}%` }}
            />
          </div>
          <span className="text-violet-200">
            {result ? `${animatedValues.scoreNumber}/100` : "--/100"}
          </span>
        </div>
      </div>

      {loadingAnalysis && (
        <div className="scanner-panel mt-6 rounded-[26px] border border-violet-400/20 bg-[#090c16]/90 p-5">
          <div className="relative z-10">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Analyzing property...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="metric-bar mt-3 h-3 rounded-full">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-400"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="mt-4 grid gap-3 text-xs uppercase tracking-[0.24em] text-slate-400 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                Pulling comps
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                Estimating repairs
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                Pricing spread
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4 rounded-[28px] border border-violet-400/16 bg-[#080b14]/92 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.34)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                Analysis Output
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {formatMoney(animatedValues.spread)}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Estimated spread after repairs and offer window.
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${scoreTone.chip}`}
            >
              {result.scoreLabel} • {animatedValues.scoreNumber}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="hover-float rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">ARV</p>
              <p className="mt-2 font-semibold text-white">
                {formatMoney(animatedValues.arv)}
              </p>
            </div>

            <div className="hover-float rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Repairs</p>
              <p className="mt-2 font-semibold text-white">
                {formatMoney(animatedValues.repairs)}
              </p>
            </div>

            <div className="hover-float rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Max Offer</p>
              <p className="mt-2 font-semibold text-white">
                {formatMoney(animatedValues.maxOffer)}
              </p>
            </div>

            <div className="hover-float rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Spread</p>
              <p className="mt-2 font-semibold text-white">
                {formatMoney(animatedValues.spread)}
              </p>
            </div>

            <div className="hover-float rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Score</p>
              <p className="mt-2 font-semibold text-white">
                {result.scoreLabel} ({animatedValues.scoreNumber}/100)
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Formula Summary
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {result.explanation}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
        <h3 className="font-semibold text-white">1. AI Seller Reply Generator</h3>
        <textarea
          placeholder="Paste what the seller said..."
          value={sellerMessage}
          onChange={(e) => setSellerMessage(e.target.value)}
          rows={4}
          className="glass-input w-full rounded-2xl p-3 text-white placeholder:text-slate-500"
        />
        <button
          onClick={generateReply}
          disabled={loadingReply}
          className="neon-button rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loadingReply ? "Generating..." : "Generate AI Reply"}
        </button>

        {aiReply && (
          <div className="space-y-2">
            <div className="rounded-2xl border border-violet-400/12 bg-[#0a0d16] p-3 text-sm text-slate-200">
              {aiReply}
            </div>
            <button
              onClick={() => copyText(aiReply)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
            >
              Copy Reply
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
        <h3 className="font-semibold text-white">2. AI Deal Explanation</h3>
        <button
          onClick={generateExplanation}
          disabled={loadingExplain}
          className="neon-button rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loadingExplain ? "Generating..." : "Explain This Deal"}
        </button>

        {dealExplanation && (
          <div className="space-y-2">
            <div className="rounded-2xl border border-violet-400/12 bg-[#0a0d16] p-3 text-sm text-slate-200">
              {dealExplanation}
            </div>
            <button
              onClick={() => copyText(dealExplanation)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
            >
              Copy Explanation
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
        <h3 className="font-semibold text-white">3. AI Buyer Blast Generator</h3>
        <textarea
          placeholder="Optional buyer notes..."
          value={buyerNotes}
          onChange={(e) => setBuyerNotes(e.target.value)}
          rows={3}
          className="glass-input w-full rounded-2xl p-3 text-white placeholder:text-slate-500"
        />
        <button
          onClick={generateBuyerBlast}
          disabled={loadingBlast}
          className="neon-button rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loadingBlast ? "Generating..." : "Generate Buyer Blast"}
        </button>

        {buyerBlast && (
          <div className="space-y-2">
            <div className="whitespace-pre-wrap rounded-2xl border border-violet-400/12 bg-[#0a0d16] p-3 text-sm text-slate-200">
              {buyerBlast}
            </div>
            <button
              onClick={() => copyText(buyerBlast)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
            >
              Copy Buyer Blast
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
