'use client';
import { useEffect, useState } from 'react';
import { adm, mediaUrl, uploadFile } from '@/lib/api';

const STATUSES = ['Completed', 'Under Construction', 'Upcoming'];
const CATEGORIES = ['Infrastructure', 'Road', 'Building', 'Amenity', 'Landscape', 'Plot Zone'];
const SHAPES = ['gate', 'road', 'park', 'clubhouse', 'utility', 'sectorA', 'sectorB', 'sectorC', 'building'];

export default function ConstructionAdmin() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const [newZone, setNewZone] = useState({ code: '', name: '', category: 'Infrastructure', status: 'Upcoming', progress: 0, targetDate: '', description: '', shape: 'building', gridX: 0, gridZ: 0, width: 2.5, depth: 2.5 });
  const [newUpdate, setNewUpdate] = useState({ title: '', area: '', status: 'Under Construction', description: '', photos: [] });
  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '', stage: 'Under Construction', takenAt: '' });

  const load = () => adm('/construction').then(setData).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  async function saveOverview(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const updated = await adm('/construction', { method: 'PUT', body: data });
      setData(updated);
      flash('Construction progress and 3D layout saved to live website.');
    } catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  }

  async function saveZone(zone) {
    setErr('');
    try {
      const updated = await adm('/construction/zones/' + zone._id, { method: 'PUT', body: zone });
      setData(updated);
      flash(`Updated "${zone.name}" on the 3D layout.`);
    } catch (x) { setErr(x.message); }
  }

  async function addZone(e) {
    e.preventDefault();
    setErr('');
    try {
      const updated = await adm('/construction/zones', { method: 'POST', body: newZone });
      setData(updated);
      setNewZone({ code: '', name: '', category: 'Infrastructure', status: 'Upcoming', progress: 0, targetDate: '', description: '', shape: 'building', gridX: 0, gridZ: 0, width: 2.5, depth: 2.5 });
      flash('New 3D layout zone added.');
    } catch (x) { setErr(x.message); }
  }

  async function deleteZone(zoneId) {
    if (!confirm('Remove this zone from the 3D layout?')) return;
    const updated = await adm('/construction/zones/' + zoneId, { method: 'DELETE' });
    setData(updated);
  }

  async function uploadZonePhoto(zoneId, file) {
    if (!file) return;
    const r = await uploadFile(file);
    const zone = data.zones.find((z) => z._id === zoneId);
    if (!zone) return;
    await saveZone({ ...zone, photos: [...(zone.photos || []), r.url] });
  }

  async function addUpdate(e) {
    e.preventDefault();
    setErr('');
    try {
      const updated = await adm('/construction/updates', { method: 'POST', body: newUpdate });
      setData(updated);
      setNewUpdate({ title: '', area: '', status: 'Under Construction', description: '', photos: [] });
      flash('Construction milestone update published.');
    } catch (x) { setErr(x.message); }
  }

  async function addGalleryPhoto(e) {
    e.preventDefault();
    if (!newPhoto.url) return setErr('Upload a photo first.');
    setErr('');
    try {
      const updated = await adm('/construction/gallery', { method: 'POST', body: newPhoto });
      setData(updated);
      setNewPhoto({ url: '', caption: '', stage: 'Under Construction', takenAt: '' });
      flash('Real construction photograph added to public gallery.');
    } catch (x) { setErr(x.message); }
  }

  if (!data) return <p>Loading construction manager...</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Construction Progress & 3D Layout</h1>
        <p className="mt-1 text-sm text-dusk/65">
          Every update here immediately drives the public interactive 3D masterplan, progress bars, and site photo gallery.
        </p>
      </div>

      {msg && <p role="status" className="rounded-xl bg-field px-4 py-3 text-sm font-medium text-white">{msg}</p>}
      {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}

      {/* Overall Progress & Architectural Plan */}
      <form onSubmit={saveOverview} className="space-y-5 rounded-2xl border border-fog bg-white p-6">
        <h2 className="font-display text-xl font-semibold">Overall Project Status</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Project Title</label>
            <input className="input" value={data.projectTitle || ''} onChange={(e) => setData({ ...data, projectTitle: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Current Phase</label>
            <input className="input" value={data.currentPhase || ''} onChange={(e) => setData({ ...data, currentPhase: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Overall Completion ({data.overallProgress}%)</label>
            <input type="range" min="0" max="100" className="mt-2 w-full accent-field" value={data.overallProgress || 0} onChange={(e) => setData({ ...data, overallProgress: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Summary</label>
          <textarea className="input" rows={2} value={data.summary || ''} onChange={(e) => setData({ ...data, summary: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Architectural Site Plan / Blueprint Image (optional)</label>
          <div className="flex flex-wrap items-center gap-4">
            {data.architecturalPlanImage && <img src={mediaUrl(data.architecturalPlanImage)} alt="Blueprint" className="h-20 w-32 rounded-lg border object-cover" />}
            <label className="cursor-pointer rounded-lg border border-dusk px-4 py-2 text-sm font-medium hover:bg-chalk">
              Upload Plan Image
              <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={async (e) => {
                const file = e.target.files[0]; e.target.value = '';
                if (!file) return;
                const r = await uploadFile(file);
                setData({ ...data, architecturalPlanImage: r.url });
              }} />
            </label>
            {data.architecturalPlanImage && <button type="button" onClick={() => setData({ ...data, architecturalPlanImage: '' })} className="text-sm text-red-700 underline">Remove</button>}
          </div>
        </div>
        <button disabled={busy} className="btn btn-dark !py-2.5">{busy ? 'Saving...' : 'Save Overview & 3D Changes'}</button>
      </form>

      {/* 3D Layout Zones */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">3D Masterplan Zones & Structures</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {(data.zones || []).map((z, idx) => (
            <div key={z._id || z.code} className="space-y-3 rounded-2xl border border-fog bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-chalk px-2.5 py-1 text-xs font-semibold text-dusk">{z.code} · {z.shape}</span>
                <button type="button" onClick={() => deleteZone(z._id)} className="text-xs text-red-700 underline">Delete zone</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Zone Name</label>
                  <input className="input !py-2 text-sm" value={z.name} onChange={(e) => {
                    const zones = [...data.zones]; zones[idx] = { ...z, name: e.target.value }; setData({ ...data, zones });
                  }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Status</label>
                  <select className="input !py-2 text-sm" value={z.status} onChange={(e) => {
                    const zones = [...data.zones];
                    const st = e.target.value;
                    zones[idx] = { ...z, status: st, progress: st === 'Completed' ? 100 : st === 'Upcoming' && z.progress === 100 ? 0 : z.progress };
                    setData({ ...data, zones });
                  }}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Progress ({z.progress}%)</label>
                  <input type="range" min="0" max="100" className="w-full accent-field" value={z.progress} onChange={(e) => {
                    const zones = [...data.zones]; zones[idx] = { ...z, progress: Number(e.target.value) }; setData({ ...data, zones });
                  }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Category</label>
                  <select className="input !py-2 text-sm" value={z.category} onChange={(e) => {
                    const zones = [...data.zones]; zones[idx] = { ...z, category: e.target.value }; setData({ ...data, zones });
                  }}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Target / Date</label>
                  <input className="input !py-2 text-sm" value={z.targetDate || ''} onChange={(e) => {
                    const zones = [...data.zones]; zones[idx] = { ...z, targetDate: e.target.value }; setData({ ...data, zones });
                  }} />
                </div>
              </div>
              <textarea className="input !py-2 text-sm" rows={2} placeholder="Description..." value={z.description || ''} onChange={(e) => {
                const zones = [...data.zones]; zones[idx] = { ...z, description: e.target.value }; setData({ ...data, zones });
              }} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(z.photos || []).map((u, pi) => (
                    <img key={u + pi} src={mediaUrl(u)} alt="" className="h-10 w-14 rounded object-cover" />
                  ))}
                  <label className="cursor-pointer rounded border border-dashed border-dusk px-2.5 py-1 text-xs">
                    + Zone Photo
                    <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; uploadZonePhoto(z._id, f); }} />
                  </label>
                </div>
                <button type="button" onClick={() => saveZone(z)} className="rounded-full bg-dusk px-4 py-1.5 text-xs font-semibold text-white hover:bg-field">
                  Save Zone
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new 3D Zone */}
        <form onSubmit={addZone} className="space-y-4 rounded-2xl border border-dashed border-dusk/30 bg-white p-6">
          <h3 className="font-display text-lg font-semibold">+ Add New Construction Area / Structure to 3D Layout</h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <input className="input" placeholder="Code (e.g. Z-POOL)" value={newZone.code} onChange={(e) => setNewZone({ ...newZone, code: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Zone Name *" required value={newZone.name} onChange={(e) => setNewZone({ ...newZone, name: e.target.value })} />
            <select className="input" value={newZone.status} onChange={(e) => setNewZone({ ...newZone, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            <select className="input" value={newZone.shape} onChange={(e) => setNewZone({ ...newZone, shape: e.target.value })}>
              {SHAPES.map((s) => <option key={s} value={s}>3D Shape: {s}</option>)}
            </select>
            <input type="number" step="0.5" className="input" placeholder="3D X (-6 to 6)" value={newZone.gridX} onChange={(e) => setNewZone({ ...newZone, gridX: Number(e.target.value) })} />
            <input type="number" step="0.5" className="input" placeholder="3D Z (-6 to 6)" value={newZone.gridZ} onChange={(e) => setNewZone({ ...newZone, gridZ: Number(e.target.value) })} />
            <input type="number" min="0" max="100" className="input" placeholder="Progress %" value={newZone.progress} onChange={(e) => setNewZone({ ...newZone, progress: Number(e.target.value) })} />
            <input className="input" placeholder="Target date" value={newZone.targetDate} onChange={(e) => setNewZone({ ...newZone, targetDate: e.target.value })} />
          </div>
          <input className="input" placeholder="Description of construction activity..." value={newZone.description} onChange={(e) => setNewZone({ ...newZone, description: e.target.value })} />
          <button className="btn btn-dark !py-2 text-sm">Add Zone to 3D Map</button>
        </form>
      </section>

      {/* Construction Updates Log + Real Photos Gallery */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-fog bg-white p-6">
          <h2 className="font-display text-xl font-semibold">Construction Activity Updates</h2>
          <form onSubmit={addUpdate} className="space-y-3 rounded-xl bg-chalk p-4">
            <input className="input" placeholder="Update headline *" required value={newUpdate.title} onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Area (e.g. Sector B Roads)" value={newUpdate.area} onChange={(e) => setNewUpdate({ ...newUpdate, area: e.target.value })} />
              <select className="input" value={newUpdate.status} onChange={(e) => setNewUpdate({ ...newUpdate, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <textarea className="input" rows={2} placeholder="Details of completed / ongoing / upcoming work..." value={newUpdate.description} onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })} />
            <button className="btn btn-dark !py-2 text-sm">Post Milestone Update</button>
          </form>
          <ul className="divide-y divide-fog">
            {(data.updates || []).map((u) => (
              <li key={u._id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">{u.title} <span className="ml-2 rounded bg-chalk px-2 py-0.5 text-xs">{u.status}</span></p>
                  <p className="text-xs text-dusk/60">{u.area} · {new Date(u.date).toLocaleDateString()}</p>
                  {u.description && <p className="mt-1 text-dusk/75">{u.description}</p>}
                </div>
                <button type="button" onClick={async () => setData(await adm('/construction/updates/' + u._id, { method: 'DELETE' }))} className="text-xs text-red-700 underline">Delete</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-fog bg-white p-6">
          <h2 className="font-display text-xl font-semibold">Real Construction Photographs</h2>
          <form onSubmit={addGalleryPhoto} className="space-y-3 rounded-xl bg-chalk p-4">
            <div className="flex flex-wrap items-center gap-3">
              {newPhoto.url && <img src={mediaUrl(newPhoto.url)} alt="Preview" className="h-16 w-24 rounded object-cover" />}
              <label className="cursor-pointer rounded-lg border border-dusk bg-white px-4 py-2 text-sm font-medium">
                {newPhoto.url ? 'Change Photo' : 'Upload Real Site Photo'}
                <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={async (e) => {
                  const file = e.target.files[0]; e.target.value = '';
                  if (!file) return;
                  const r = await uploadFile(file);
                  setNewPhoto({ ...newPhoto, url: r.url });
                }} />
              </label>
            </div>
            <input className="input" placeholder="Caption (e.g. Sector A Asphalt Laying)" value={newPhoto.caption} onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="input" value={newPhoto.stage} onChange={(e) => setNewPhoto({ ...newPhoto, stage: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="Date taken (e.g. Nov 2026)" value={newPhoto.takenAt} onChange={(e) => setNewPhoto({ ...newPhoto, takenAt: e.target.value })} />
            </div>
            <button className="btn btn-dark !py-2 text-sm">Add Photo to Public Site</button>
          </form>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(data.gallery || []).map((g) => (
              <div key={g._id} className="overflow-hidden rounded-xl border border-fog">
                <img src={mediaUrl(g.url)} alt={g.caption} className="aspect-[4/3] w-full object-cover" />
                <div className="p-2 text-xs">
                  <p className="truncate font-semibold">{g.caption || g.stage}</p>
                  <button type="button" onClick={async () => setData(await adm('/construction/gallery/' + g._id, { method: 'DELETE' }))} className="mt-1 text-red-700 underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
