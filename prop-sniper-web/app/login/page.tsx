"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

import GlassCard from "@/components/mvp/glass-card"
import { hasSupabaseEnv } from "@/lib/mvp/env"

export default function LoginPage() {
  const emailInput = useRef<HTMLInputElement>(null)
  const supabaseReady = useMemo(() => hasSupabaseEnv(), [])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setMessage("")

    if (!supabaseReady) {
      setMessage("Sign-in is currently unavailable. Please try again later.")
      return
    }

    if (submitting || resetting) return
    setSubmitting(true)
    try {
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) {
        setMessage(error.message.toLowerCase().includes("email not confirmed")
          ? "Confirm your email using the link in your inbox before logging in."
          : "Unable to log in. Check your email and password and try again.")
        return
      }
      if (!data.session) {
        setMessage("No sign-in session was returned. Please try again.")
        return
      }
      // A full navigation lets the server read the session cookies on the first request.
      window.location.assign("/dashboard")
    } catch {
      setMessage("Unable to reach the sign-in service. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordReset() {
    setMessage("")

    if (!supabaseReady) {
      setMessage("Password reset is currently unavailable. Please try again later.")
      return
    }

    if (submitting || resetting) return
    if (!emailInput.current?.reportValidity()) return
    setResetting(true)
    try {
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        setMessage("Unable to request a reset link. Please try again later.")
        return
      }
      setMessage("If an account exists for that email, you will receive a password reset link. Open it in this browser.")
    } catch {
      setMessage("Unable to reach the password reset service. Please try again.")
    } finally {
      setResetting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-12 text-white">
      <GlassCard className="w-full max-w-md p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-violet-300/80">Welcome back</p>
        <h1 className="mt-3 text-3xl font-semibold">Log in to PropSniper.AI</h1>
        <p className="mt-2 text-sm text-zinc-400">Jump back into your lead workflow, follow-ups, and AI deal tools.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            ref={emailInput}
            aria-label="Email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-label="Password"
            autoComplete="current-password"
            required
            placeholder="Password"
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none"
          />
          <button type="submit" disabled={submitting || resetting} className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium shadow-[0_0_22px_rgba(124,58,237,0.22)]">
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => void handlePasswordReset()}
            disabled={submitting || resetting}
            className="text-sm text-violet-300 transition-colors duration-200 hover:text-violet-200"
          >
            {resetting ? "Sending reset link..." : "Forgot password?"}
          </button>
        </div>
        {message ? <p role="status" className="mt-4 text-sm text-zinc-400">{message}</p> : null}
        <p className="mt-6 text-sm text-zinc-500">
          Need an account?{" "}
          <Link href="/signup" className="text-violet-300">
            Sign up
          </Link>
        </p>
      </GlassCard>
    </main>
  )
}
