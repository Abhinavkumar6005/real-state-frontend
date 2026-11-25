'use client';
import { useEffect, useState } from 'react';
import Editor from '@/components/Editor';
import { adm } from '@/lib/api';

const TABS = [['home', 'Home page'], ['about', 'About page'], ['contact', 'Contact and booking'], ['brand', 'Brand and footer'], ['seo', 'Page titles and descriptions']];

export default function Content() {
  const [data, setData] = useState(null), [tab, setTab] = useState('home'), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  useEffect(() => { adm('/content').then(setData).catch((e) => setErr(e.message)); }, []);
  if (err) return <p role="alert" className="text-red-700">{err}</p>;
  if (!data) return <p>Loading...</p>;
  const view = tab === 'brand' ? { brand: data.brand, footer: data.footer } : { [tab]: data[tab] };
  const update = (nv) => setData({ ...data, ...nv });
  async function save() {
    setMsg(''); setErr('');
    try { await adm('/content', { method: 'PUT', body: data }); setMsg('Saved. The website now shows these changes.'); } catch (x) { setErr(x.message); }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Site content</h1>
        <button onClick={save} className="btn btn-dark !py-2.5">Save changes</button>
      </div>
      <div role="tablist" className="mt-6 flex flex-wrap gap-2">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm ${tab === k ? 'bg-dusk text-white' : 'bg-white'}`}>{l}</button>)}</div>
      {msg && <p role="status" className="mt-4 rounded-lg bg-field px-4 py-2 text-white">{msg}</p>}
      {err && <p role="alert" className="mt-4 text-red-700">{err}</p>}
      <div className="mt-6 rounded-xl bg-white p-6"><Editor value={view} onChange={(nv) => update(nv)} /></div>
      <p className="mt-4 text-sm text-dusk/60">Leave email, phone and address empty until you have approved details. Empty contact fields are hidden on the website.</p>
    </div>
  );
}
