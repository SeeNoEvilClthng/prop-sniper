'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Account created.')
    router.push('/login')
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-bold">Create your account</h1>

      <form onSubmit={handleSignup} className="mt-6 space-y-4">
        <input
          className="w-full rounded-xl border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-xl border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full rounded-xl bg-black p-3 text-white">
          Sign up
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  )
}