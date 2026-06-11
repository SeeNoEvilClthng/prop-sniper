"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

import GlassCard from "@/components/mvp/glass-card"
import { hasSupabaseEnv } from "@/lib/mvp/env"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabaseReady = useMemo(() => hasSupabaseEnv(), [])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supabaseReady) {
      return
    }

    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let mounted = true

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true)
      }
    })

    client.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session) {
        setReady(true)
      } else {
        setMessage("Open this page from the password reset email to create a new password.")
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabaseReady])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setMessage("")

    if (!supabaseReady) {
      setMessage("Demo mode is active. Add Supabase keys to enable password reset.")
      return
    }

    if (password.length < 8) {
      setMessage("Use at least 8 characters for the new password.")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    setSubmitting(true)

    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await client.auth.updateUser({ password })

    if (error) {
      setMessage(error.message)
      setSubmitting(false)
      return
    }

    setMessage("Password updated. Redirecting to login...")
    setTimeout(() => {
      router.replace("/login")
      router.refresh()
    }, 800)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-12 text-white">
      <GlassCard className="w-full max-w-md p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-violet-300/80">Secure your account</p>
        <h1 className="mt-3 text-3xl font-semibold">Set a new password</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Open this page from the reset email, then choose a new password for your PropSniper.AI account.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            type="password"
            disabled={!ready}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            type="password"
            disabled={!ready}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            disabled={!ready || submitting}
            className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium shadow-[0_0_22px_rgba(124,58,237,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating password..." : "Update password"}
          </button>
        </form>
        {supabaseReady ? (
          message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null
        ) : (
          <p className="mt-4 text-sm text-zinc-400">
            Demo mode is active. Add Supabase keys to enable password reset.
          </p>
        )}
        <p className="mt-6 text-sm text-zinc-500">
          Back to{" "}
          <Link href="/login" className="text-violet-300">
            login
          </Link>
        </p>
      </GlassCard>
    </main>
  )
}
