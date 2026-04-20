"use client";

import Link from "next/link";
import { useState } from "react";

const benefits = [
  "7-day free trial",
  "Then $29/month unless canceled",
  "Lead dashboard access",
  "Pipeline management",
  "Basic deal scoring",
  "Cancel anytime before billing",
];

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout-trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          company: form.company,
        }),
      });

      const text = await res.text();
      let data: { url?: string; error?: string } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server did not return valid JSON.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (!data.url) {
        throw new Error("Missing checkout URL.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_24%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 font-bold text-white">
                  PS
                </span>
                <span>PropSniper</span>
              </Link>

              <div className="mt-10">
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-sky-200">
                  Start your free trial
                </p>
                <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
                  Try PropSniper free for 7 days.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Start your trial now and keep full access during the 7-day
                  trial. After that, it becomes $29/month unless canceled.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-4"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-sm text-emerald-300 ring-1 ring-emerald-400/30">
                      ✓
                    </span>
                    <span className="text-sm text-slate-200">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                <p className="text-sm font-semibold text-sky-200">
                  Trial offer
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Today: $0 • After 7 days: $29/month unless canceled.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#0c1524]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200">
                Starter plan
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Start 7-day free trial
              </h2>
              <p className="mt-3 text-slate-300">
                Then $29/month unless canceled before trial ends.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-white/10 bg-[#0a1321] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Company or brand
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                  className="w-full rounded-2xl border border-white/10 bg-[#0a1321] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/10 bg-[#0a1321] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
                  required
                />
              </div>

              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                <p className="text-sm font-semibold text-sky-200">Today: $0</p>
                <p className="mt-1 text-sm text-slate-300">
                  After 7 days: $29/month unless canceled.
                </p>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Redirecting..." : "Start 7-Day Free Trial"}
              </button>

              <p className="text-center text-xs leading-6 text-slate-500">
                By continuing, you agree to start a trial subscription that
                renews automatically at $29/month unless canceled.
              </p>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-sky-300 transition hover:text-sky-200"
                >
                  Log in
                </Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}