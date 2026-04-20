"use client";

import { useState } from "react";

export default function ManageBillingPage() {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-20 text-white">
      <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <h1 className="text-3xl font-bold">Manage Billing</h1>
        <p className="mt-3 text-slate-300">
          Paste a Stripe customer ID here to open the billing portal.
        </p>

        <input
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="cus_..."
          className="mt-6 w-full rounded-2xl border border-white/10 bg-[#0a1321] px-4 py-3 text-white placeholder:text-slate-500 outline-none"
        />

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          onClick={openPortal}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Opening..." : "Open Billing Portal"}
        </button>
      </div>
    </main>
  );
}