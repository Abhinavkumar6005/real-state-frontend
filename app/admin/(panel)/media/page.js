'use client';
import { useEffect, useState } from 'react';
import { adm, mediaUrl, uploadFile } from '@/lib/api';

export default function Media() {
  const [files, setFiles] = useState([]), [err, setErr] = useState(''), [copied, setCopied] = useState('');
  const load = () => adm('/media').then(setFiles).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const run = async (fn) => { setErr(''); try { await fn(); load(); } catch (x) { setErr(x.message); } };
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Media</h1>
      <p className="mt-2 text-dusk/70">JPG, PNG or WebP images up to 5 MB. MP4 or WebM videos up to 40 MB.</p>
      <label className="btn btn-dark mt-5 cursor-pointer !py-2.5">Upload file<input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; f && run(() => uploadFile(f)); }} /></label>
      {err && <p role="alert" className="mt-4 text-red-700">{err}</p>}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {files.length === 0 && <li className="text-dusk/60">No files yet.</li>}
        {files.map((f) => (
          <li key={f.name} className="overflow-hidden rounded-xl bg-white">
            {f.video ? <video src={mediaUrl(f.url)} className="aspect-video w-full object-cover" muted /> : <img src={mediaUrl(f.url)} alt="" className="aspect-video w-full object-cover" />}
            <div className="space-y-1 p-3 text-sm">
              <p className="truncate">{f.name} ({(f.size / 1048576).toFixed(1)} MB)</p>
              <div className="flex flex-wrap gap-3">
                <button className="underline" onClick={() => { navigator.clipboard.writeText(f.url); setCopied(f.name); }}>{copied === f.name ? 'Copied' : 'Copy URL'}</button>
                <label className="cursor-pointer underline">Replace<input type="file" className="sr-only" accept={f.video ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'} onChange={(e) => { const x = e.target.files[0]; e.target.value = ''; x && run(() => uploadFile(x, f.name)); }} /></label>
                <button className="text-red-700 underline" onClick={() => confirm('Delete this file? Anything using it will show a broken image.') && run(() => adm('/media/' + f.name, { method: 'DELETE' }))}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
