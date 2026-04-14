'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Creating account...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        role: 'user',
        plan: 'free',
      });

      if (profileError) {
        setMessage(profileError.message);
        return;
      }
    }

    setMessage('Account created. Check your email if confirmation is enabled.');
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={handleSignup} className="space-y-4 rounded-lg border p-4">
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="px-4 py-2 rounded bg-black text-white" type="submit">
          Sign Up
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </main>
  );
}