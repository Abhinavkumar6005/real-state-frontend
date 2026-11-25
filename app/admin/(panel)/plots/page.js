'use client';
import { useEffect, useState } from 'react';
import { adm, mediaUrl, uploadFile } from '@/lib/api';

const empty = {
  title: '',
  plotNumber: '',
  plotCode: '',
  location: '',
  area: '',
  dimensions: '',
  facing: '',
  price: '',
  description: '',
  features: [],
  images: [],
  availability: 'Available',
  featured: false,
  published: true,
};

function PlotField({ id, label, value, onChange, placeholder, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      <input
        id={id}
        className="input"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

export default function Plots() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');

  const load = () => adm('/plots').then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const move = async (i, d) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    await adm('/plots/reorder', { method: 'PUT', body: { ids: next.map((p) => p._id) } });
  };

  const toggle = async (p, field) => {
    await adm('/plots/' + p._id, { method: 'PUT', body: { ...p, [field]: !p[field] } });
    load();
  };

  const del = async (p) => {
    if (confirm(`Delete "${p.title}"?`)) {
      await adm('/plots/' + p._id, { method: 'DELETE' });
      load();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Plots Management</h1>
          <p className="mt-1 text-sm text-dusk/65">Published plots automatically appear on the public homepage, explorer, booking dropdown, and 3D layout.</p>
        </div>
        <button className="btn btn-dark !py-2.5" onClick={() => setForm(empty)}>+ Add new plot</button>
      </div>
      {err && <p role="alert" className="mt-4 text-red-700">{err}</p>}

      <ul className="mt-6 space-y-3">
        {items.length === 0 && (
          <li className="rounded-2xl border border-fog bg-white p-8 text-dusk/60">
            No plots yet. Click &ldquo;Add new plot&rdquo; to publish your first plot to the public website.
          </li>
        )}
        {items.map((p, i) => {
          const status = p.availability === 'Booked' ? 'Reserved' : p.availability;
          return (
            <li key={p._id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-fog bg-white p-4">
              {p.images?.[0] ? (
                <img src={mediaUrl(p.images[0])} alt="" className="h-16 w-24 rounded-lg object-cover" />
              ) : (
                <div className="grid h-16 w-24 place-items-center rounded-lg bg-fog text-xs text-dusk/50">No photo</div>
              )}
              <div className="min-w-[200px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold">{p.title}</p>
                  {p.plotNumber && <span className="rounded bg-chalk px-2 py-0.5 text-xs font-semibold">Plot {p.plotNumber}</span>}
                  {p.plotCode && <span className="text-xs text-dusk/50">#{p.plotCode}</span>}
                  {p.featured && <span className="rounded-full bg-marigold px-2.5 py-0.5 text-xs font-semibold text-dusk">Featured</span>}
                </div>
                <p className="mt-0.5 text-sm text-dusk/65">
                  {[p.location, p.area, p.dimensions, p.price, status].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.published ? 'bg-field text-white' : 'bg-fog text-dusk'}`}>
                {p.published ? 'Published' : 'Draft'}
              </span>
              <div className="flex flex-wrap gap-3 text-sm">
                <button aria-label={`Move ${p.title} up`} onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30">Up</button>
                <button aria-label={`Move ${p.title} down`} onClick={() => move(i, 1)} disabled={i === items.length - 1} className="disabled:opacity-30">Down</button>
                <button className="underline" onClick={() => toggle(p, 'featured')}>{p.featured ? 'Unfeature' : 'Feature'}</button>
                <button className="underline" onClick={() => toggle(p, 'published')}>{p.published ? 'Unpublish' : 'Publish'}</button>
                <button className="underline" onClick={() => setForm({ ...empty, ...p })}>Edit</button>
                <button className="text-red-700 underline" onClick={() => del(p)}>Delete</button>
              </div>
            </li>
          );
        })}
      </ul>

      {form && <PlotForm initial={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}
    </div>
  );
}

function PlotForm({ initial, onClose, onSaved }) {
  const [f, setF] = useState(() => ({
    ...initial,
    availability: initial.availability === 'Booked' ? 'Reserved' : (initial.availability || 'Available'),
    featuresText: Array.isArray(initial.features) ? initial.features.join(', ') : '',
  }));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const setField = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((prev) => ({ ...prev, [k]: val }));
  };

  async function addImages(e) {
    setErr('');
    for (const file of e.target.files) {
      try {
        const r = await uploadFile(file);
        setF((c) => ({ ...c, images: [...(c.images || []), r.url] }));
      } catch (x) {
        setErr(x.message);
      }
    }
    e.target.value = '';
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const payload = {
        ...f,
        features: f.featuresText.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await adm(f._id ? '/plots/' + f._id : '/plots', { method: f._id ? 'PUT' : 'POST', body: payload });
      onSaved();
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-dusk/60 p-4 py-8">
      <form onSubmit={save} role="dialog" aria-modal="true" aria-label="Plot details" className="my-auto w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">{f._id ? 'Edit plot' : 'Add new plot'}</h2>
          <button type="button" onClick={onClose} className="text-sm underline">Close</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <PlotField id="plot-title" label="Plot Title *" placeholder="e.g. East-Facing Corner Villa Plot" value={f.title || ''} onChange={setField('title')} required />
          </div>
          <PlotField id="plot-number" label="Plot Number" placeholder="e.g. A-101" value={f.plotNumber || ''} onChange={setField('plotNumber')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <PlotField id="plot-code" label="Unique Plot ID (auto if blank)" placeholder="e.g. VST-101" value={f.plotCode || ''} onChange={setField('plotCode')} />
          <PlotField id="plot-location" label="Sector / Location" placeholder="e.g. Sector A, Near Park" value={f.location || ''} onChange={setField('location')} />
          <PlotField id="plot-price" label="Price" placeholder="e.g. ₹48,00,000" value={f.price || ''} onChange={setField('price')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <PlotField id="plot-area" label="Total Area" placeholder="e.g. 2,400 sq. ft." value={f.area || ''} onChange={setField('area')} />
          <PlotField id="plot-dimensions" label="Dimensions" placeholder="e.g. 40 ft × 60 ft" value={f.dimensions || ''} onChange={setField('dimensions')} />
          <PlotField id="plot-facing" label="Facing" placeholder="e.g. East / Corner" value={f.facing || ''} onChange={setField('facing')} />
        </div>

        <div>
          <label htmlFor="plot-features" className="mb-1 block text-sm font-semibold">Plot Amenities & Features (comma-separated)</label>
          <input
            id="plot-features"
            className="input"
            autoComplete="off"
            placeholder="Corner Plot, Park Facing, 12m Road Access, Ready Water Line"
            value={f.featuresText}
            onChange={(e) => setF((prev) => ({ ...prev, featuresText: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="plot-description" className="mb-1 block text-sm font-semibold">Description</label>
          <textarea id="plot-description" className="input" rows={3} value={f.description || ''} onChange={setField('description')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="plot-availability" className="mb-1 block text-sm font-semibold">Availability Status</label>
            <select id="plot-availability" className="input" value={f.availability} onChange={setField('availability')}>
              {['Available', 'Reserved', 'Sold'].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={!!f.published} onChange={setField('published')} />
              Publish on public website
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={!!f.featured} onChange={setField('featured')} />
              Feature on homepage
            </label>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold">Plot Images (JPG, PNG or WebP, up to 5 MB each)</p>
          <div className="flex flex-wrap gap-3">
            {(f.images || []).map((u, i) => (
              <div key={u + i} className="relative">
                <img src={mediaUrl(u)} alt="" className="h-16 w-24 rounded-lg object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setF((prev) => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-700 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="grid h-16 w-24 cursor-pointer place-items-center rounded-lg border border-dashed border-dusk text-sm hover:bg-chalk">
              + Upload
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={addImages} className="sr-only" />
            </label>
          </div>
        </div>

        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <div className="flex items-center gap-4 pt-2">
          <button disabled={busy} className="btn btn-dark !py-2.5">{busy ? 'Saving...' : 'Save plot'}</button>
          <button type="button" onClick={onClose} className="underline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
