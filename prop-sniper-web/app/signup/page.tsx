"use client";

import Link from "next/link";
import { useState } from "react";

const benefits = [
  "Track leads in one place",
  "Score deals faster",
  "Manage your pipeline better",
  "Stay organized without spreadsheets",
];

const stats = [
  { label: "Starting plan", value: "$29/mo" },
  { label: "Built for", value: "Wholesalers" },
  { label: "Focus", value: "Lead speed" },
];

const socialProof = [
  {
    name: "Marcus Allen",
    role: "Wholesale Investor",
    quote:
      "Way cleaner than trying to track everything in notes and spreadsheets.",
  },
  {
    name: "Jasmine Carter",
    role: "Acquisitions Manager",
    quote:
      "The setup feels fast, organized, and more serious than most starter tools.",
  },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    company: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // replace this later with your real signup logic
    alert("Signup form submitted. Connect this to your auth next.");
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
                  Join the platform
                </p>

                <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
                  Build a better lead system from day one.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Create your account and start managing leads, reviewing deals,
                  and organizing your acquisitions workflow in one place.
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
                Create account
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Start with Starter at $29/mo
              </h2>
              <p className="mt-3 text-slate-300">
                Set up your account and start building your lead pipeline.
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
                    placeholder="Create a password"
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

              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                <p className="text-sm font-semibold text-sky-200">
                  Starter plan begins at $29/month
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Upgrade later as your workflow grows.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:opacity-95"
              >
                Create Account
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

              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-sky-300 transition hover:text-sky-200"
                >
                  Log in
                </Link>
              </p>

              <p className="text-center text-xs leading-6 text-slate-500">
                By creating an account, you agree to our Terms and Privacy Policy.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}