'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    const d = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message);
      localStorage.setItem('vp_token', j.token); router.replace('/admin/dashboard');
    } catch (x) { setErr(x.message || 'Could not sign in.'); } finally { setBusy(false); }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-dusk px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-field">Vistara Plots</p>
            <h1 className="font-display text-2xl font-bold leading-tight">Admin sign in</h1>
          </div>
        </div>
        <label className="mt-6 block text-sm font-semibold" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input mt-1" />
        <label className="mt-4 block text-sm font-semibold" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input mt-1" />
        {err && <p role="alert" className="mt-4 text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="btn btn-dark mt-6 w-full disabled:opacity-60">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </main>
  );
}
