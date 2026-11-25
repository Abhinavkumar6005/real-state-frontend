'use client';
import { useState } from 'react';
import { uploadFile, mediaUrl } from '@/lib/api';

// Upload one file (image or video) and return its URL. Validation happens on the server too.
export default function ImageField({ value, onChange, accept = 'image/jpeg,image/png,image/webp', label = 'Upload' }) {
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  async function pick(e) {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    setErr(''); setBusy(true);
    try { const r = await uploadFile(f); onChange(r.url); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  const isVideo = /\.(mp4|webm)$/.test(value || '');
  return (
    <div className="flex flex-wrap items-center gap-3">
      {value && (isVideo ? <video src={mediaUrl(value)} className="h-16 w-28 rounded object-cover" muted /> : <img src={mediaUrl(value)} alt="" className="h-16 w-28 rounded object-cover" />)}
      <label className="cursor-pointer rounded-lg border border-fog bg-white px-3 py-2 text-sm hover:bg-chalk">
        {busy ? 'Uploading...' : value ? 'Replace' : label}
        <input type="file" accept={accept} onChange={pick} className="sr-only" />
      </label>
      {value && <button type="button" onClick={() => onChange('')} className="text-sm text-red-700 underline">Remove</button>}
      {err && <span role="alert" className="w-full text-sm text-red-700">{err}</span>}
    </div>
  );
}
