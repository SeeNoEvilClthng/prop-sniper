"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

import GlassCard from "@/components/mvp/glass-card"
import { hasSupabaseEnv } from "@/lib/mvp/env"

export default function LoginPage() {
  const router = useRouter()
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
      setMessage("Demo mode is active. Add Supabase keys to enable real auth.")
      return
    }

    setSubmitting(true)

    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setMessage("Your email still needs to be confirmed before you can log in.")
      } else {
        setMessage(error.message)
      }
      setSubmitting(false)
      return
    }

    setMessage("Signed in. Opening your workspace...")
    router.replace("/dashboard")
    router.refresh()
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 150)
  }

  async function handlePasswordReset() {
    setMessage("")

    if (!supabaseReady) {
      setMessage("Demo mode is active. Add Supabase keys to enable password reset.")
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setMessage("Enter your email first, then click reset password.")
      return
    }

    setResetting(true)

    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined

    const { error } = await client.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    })

    if (error) {
      setMessage(error.message)
      setResetting(false)
      return
    }

    setMessage("Password reset email sent. Open the link in your inbox to set a new password.")
    setResetting(false)
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
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none"
          />
          <button className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium shadow-[0_0_22px_rgba(124,58,237,0.22)]">
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => void handlePasswordReset()}
            className="text-sm text-violet-300 transition-colors duration-200 hover:text-violet-200"
          >
            {resetting ? "Sending reset link..." : "Forgot password?"}
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
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
