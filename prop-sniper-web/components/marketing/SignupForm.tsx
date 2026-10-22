"use client";

import Link from "next/link";
import { useState } from "react";

import { CTA_LABEL, SITE } from "@/lib/site";

export default function SignupForm() {
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

  // Same request as before: POST to the Stripe trial checkout route.
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
    <div className="ps-card">
      <h2>Start your Starter trial</h2>

      <form onSubmit={handleSubmit} className="ps-form">
        <div className="ps-field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            className="ps-input"
            required
          />
        </div>

        <div className="ps-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className="ps-input"
            required
          />
        </div>

        <div className="ps-field">
          <label htmlFor="company">
            Company <small>(optional)</small>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={handleChange}
            className="ps-input"
          />
        </div>

        <p className="ps-today">
          <strong>Today: $0.</strong> After {SITE.trialDays} days: ${SITE.starterPrice}/month
          unless you cancel first.
        </p>

        {error ? (
          <p className="ps-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="ps-btn ps-btn-primary ps-btn-lg ps-btn-block"
        >
          {loading ? "Redirecting to checkout…" : CTA_LABEL}
        </button>

        <p className="ps-form-foot">
          Card required at checkout. Your trial renews automatically at ${SITE.starterPrice}/month
          unless you cancel.
        </p>

        <p className="ps-form-foot">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
