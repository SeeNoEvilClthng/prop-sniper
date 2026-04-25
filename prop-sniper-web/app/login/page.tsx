"use client";

import Link from "next/link";
import { useState } from "react";

import BrandLogo from "@/components/ui/BrandLogo";

const benefits = [
  "Fast access to your dashboard",
  "Track leads in one place",
  "Review deals faster",
  "Manage your pipeline better",
];

const stats = [
  { label: "Starter plan", value: "$29/mo" },
  { label: "Free trial", value: "7 days" },
  { label: "Built for", value: "Wholesalers" },
];

const socialProof = [
  {
    name: "Marcus Allen",
    role: "Wholesale Investor",
    quote:
      "The dashboard feels way more organized than trying to keep track of deals with notes and random spreadsheets.",
  },
  {
    name: "Jasmine Carter",
    role: "Acquisitions Manager",
    quote:
      "It looks clean, feels modern, and gives you a much better system for keeping up with leads.",
  },
];

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // replace this later with your real auth login
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_24%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left Side */}
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <Link
                href="/dashboard"
                className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <BrandLogo size="xs" />
              </Link>

              <div className="mt-10">
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-sky-200">
                  Welcome back
                </p>

                <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
                  Log in and get back to your pipeline.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Access your leads, review deals, and stay on top of your
                  acquisitions workflow with a cleaner system built for speed.
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

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4">
                {socialProof.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="mb-3 flex items-center gap-1 text-yellow-300">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>

                    <p className="text-sm leading-7 text-slate-200">
                      “{item.quote}”
                    </p>

                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-slate-400">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Side */}
          <section className="rounded-[32px] border border-white/10 bg-[#0c1524]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200">
                Account login
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Sign in to PropSniper
              </h2>
              <p className="mt-3 text-slate-300">
                Log in to access your dashboard, lead system, and workflow tools.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0a1321] px-4">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-transparent py-3 text-white placeholder:text-slate-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-sm font-medium text-slate-400 transition hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/20 bg-[#0a1321]"
                  />
                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-sky-300 transition hover:text-sky-200"
                >
                  Forgot password?
                </Link>
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
                {loading ? "Signing in..." : "Log In"}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0c1524] px-3 text-sm text-slate-500">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Apple
                </button>
              </div>

              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                <p className="text-sm font-semibold text-sky-200">
                  New here?
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Start with a 7-day free trial, then continue at $29/month unless canceled.
                </p>
              </div>

              <p className="text-center text-sm text-slate-400">
                Don’t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-sky-300 transition hover:text-sky-200"
                >
                  Start free trial
                </Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
