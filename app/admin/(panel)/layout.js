'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adm } from '@/lib/api';

const nav = [
  ['Dashboard', 'dashboard'],
  ['Plots', 'plots'],
  ['Enquiries', 'enquiries'],
  ['Construction 3D', 'construction'],
  ['Site content', 'content'],
  ['Media', 'media'],
];

export default function Panel({ children }) {
  const [email, setEmail] = useState(null);
  const path = usePathname(), router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem('vp_token')) return router.replace('/admin/login');
    adm('/me').then((r) => setEmail(r.email)).catch(() => {});
  }, [router]);
  const logout = () => { localStorage.removeItem('vp_token'); router.replace('/admin/login'); };
  if (!email) return <p className="p-10">Loading...</p>;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-dusk p-5 text-white md:min-h-screen">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" className="h-9 w-9 rounded-lg object-contain" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">Vistara Plots</p>
            <p className="text-xs text-white/50">Admin Control Panel</p>
          </div>
        </div>
        <nav aria-label="Admin" className="mt-6 flex gap-2 overflow-x-auto md:flex-col">
          {nav.map(([l, h]) => (
            <Link
              key={h}
              href={'/admin/' + h}
              aria-current={path.includes(h) ? 'page' : undefined}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${path.includes(h) ? 'bg-marigold font-semibold text-dusk' : 'text-white/85 hover:bg-white/10'}`}
            >
              {l}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/15 pt-5 text-sm text-white/60 md:mt-10">
          <p className="truncate">{email}</p>
          <div className="mt-2 flex items-center gap-2">
            <button onClick={logout} className="underline hover:text-white">Sign out</button>
            <span>·</span>
            <a href="/" target="_blank" className="underline hover:text-white">View site</a>
          </div>
        </div>
      </aside>
      <main className="bg-chalk p-5 md:p-10">{children}</main>
    </div>
  );
}
