'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro'>('pro');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Updating...');

    const res = await fetch('/api/admin/set-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || 'Failed');
      return;
    }

    setMessage(`Updated ${data.updatedUser.email} to ${data.updatedUser.plan}/${data.updatedUser.role}`);
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Access Manager</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
        <div>
          <label className="block mb-1">User Email</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@email.com"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Plan</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={plan}
            onChange={(e) => setPlan(e.target.value as 'free' | 'pro')}
          >
            <option value="free">free</option>
            <option value="pro">pro</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Role</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <button className="px-4 py-2 rounded bg-black text-white" type="submit">
          Update User
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </main>
  );
}