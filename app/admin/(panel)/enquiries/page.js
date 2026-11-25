'use client';
import { useCallback, useEffect, useState } from 'react';
import { adm } from '@/lib/api';

const STATUSES = ['Pending', 'Contacted', 'Interested', 'Visit Scheduled', 'Completed'];
const fmt = (d) => new Date(d).toLocaleString();

export default function Enquiries() {
  const [list, setList] = useState({ items: [], pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    const q = new URLSearchParams({ page, ...(search && { search }), ...(status && { status }) });
    adm('/enquiries?' + q).then(setList).catch((e) => setErr(e.message));
  }, [page, search, status]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Customer Enquiries</h1>
      <p className="mt-1 text-sm text-dusk/65">Track site visit requests and plot bookings, call customers directly, and log follow-up notes.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          aria-label="Search enquiries"
          autoComplete="off"
          placeholder="Search name, email, phone or plot..."
          className="input max-w-sm"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          aria-label="Filter by status"
          className="input max-w-[220px]"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {err && <p role="alert" className="mt-4 text-red-700">{err}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-fog bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-fog text-dusk/60">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone (Click to Call)</th>
              <th className="p-4">Plot / Type</th>
              <th className="p-4">Visit Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {list.items.length === 0 && (
              <tr><td colSpan="6" className="p-6 text-dusk/60">No enquiries match these filters.</td></tr>
            )}
            {list.items.map((e) => (
              <tr key={e._id} className="cursor-pointer border-b border-fog/60 hover:bg-chalk" onClick={() => setOpen(e._id)}>
                <td className="p-4">
                  <button className="text-left font-semibold underline-offset-2 hover:underline" onClick={() => setOpen(e._id)}>{e.name}</button>
                  <div className="text-xs text-dusk/55">{e.email}</div>
                </td>
                <td className="p-4" onClick={(ev) => ev.stopPropagation()}>
                  <a href={`tel:${e.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1 rounded-full bg-field/10 px-3 py-1 font-semibold text-field hover:bg-field hover:text-white">
                    {e.phone}
                  </a>
                </td>
                <td className="p-4">
                  <span className="block font-medium">{e.plotTitle || 'General Enquiry'}</span>
                  <span className="text-xs text-dusk/55">{[e.enquiryType, e.plotNumber && `Plot ${e.plotNumber}`].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="p-4">{new Date(e.visitDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className="rounded-full bg-chalk px-3 py-1 text-xs font-semibold">{e.status}</span>
                </td>
                <td className="p-4 text-xs text-dusk/65">{fmt(e.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="underline disabled:opacity-40">Previous</button>
        <span>Page {page} of {Math.max(1, list.pages)} ({list.total} total)</span>
        <button disabled={page >= list.pages} onClick={() => setPage(page + 1)} className="underline disabled:opacity-40">Next</button>
      </div>
      {open && <Detail id={open} onClose={() => setOpen(null)} onChange={load} />}
    </div>
  );
}

function Detail({ id, onClose, onChange }) {
  const [e, setE] = useState(null);
  const [note, setNote] = useState('');
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { adm('/enquiries/' + id).then(setE); }, [id]);
  const run = async (p, opts) => {
    setErr('');
    try { setE(await adm(p, opts)); onChange(); } catch (x) { setErr(x.message); }
  };

  if (!e) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-dusk/50" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label="Enquiry details" className="h-full w-full max-w-lg overflow-y-auto bg-white p-6" onClick={(x) => x.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">{e.name}</h2>
            <p className="mt-0.5 text-xs text-dusk/55">Submitted {fmt(e.createdAt)} · {e.enquiryType || 'Site Visit'}</p>
          </div>
          <button onClick={onClose} className="underline">Close</button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`tel:${e.phone.replace(/[^+\d]/g, '')}`} className="btn btn-dark !py-2.5 text-sm">Call {e.phone}</a>
          <a href={`mailto:${e.email}`} className="btn border border-dusk !py-2.5 text-sm">Email</a>
        </div>

        <dl className="mt-6 space-y-3 rounded-xl bg-chalk p-4 text-sm">
          <div><dt className="text-xs font-semibold text-dusk/55">Email</dt><dd>{e.email}</dd></div>
          <div><dt className="text-xs font-semibold text-dusk/55">Preferred visit / booking date</dt><dd>{new Date(e.visitDate).toLocaleDateString()}</dd></div>
          {(e.plotTitle || e.plotNumber) && (
            <div><dt className="text-xs font-semibold text-dusk/55">Selected Plot</dt><dd className="font-semibold">{[e.plotNumber && `Plot ${e.plotNumber}`, e.plotTitle].filter(Boolean).join(' — ')}</dd></div>
          )}
          <div><dt className="text-xs font-semibold text-dusk/55">Message</dt><dd className="whitespace-pre-line">{e.message || 'No message'}</dd></div>
        </dl>

        <label className="mt-6 block text-sm font-semibold" htmlFor="st">Enquiry Status</label>
        <select id="st" className="input mt-1" value={e.status} onChange={(x) => run('/enquiries/' + id, { method: 'PATCH', body: { status: x.target.value } })}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        <h3 className="mt-8 font-display text-lg font-semibold">Follow-up Notes</h3>
        <ul className="mt-2 space-y-3">
          {e.notes.map((n) => (
            <li key={n._id} className="rounded-lg bg-chalk p-3 text-sm">
              {edit?.id === n._id ? (
                <>
                  <textarea className="input" rows={3} value={edit.text} onChange={(x) => setEdit({ ...edit, text: x.target.value })} />
                  <button className="mr-3 mt-2 underline" onClick={() => run(`/enquiries/${id}/notes/${n._id}`, { method: 'PUT', body: { text: edit.text } }).then(() => setEdit(null))}>Save note</button>
                  <button className="underline" onClick={() => setEdit(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <p className="whitespace-pre-line">{n.text}</p>
                  <p className="mt-1 text-xs text-dusk/50">{fmt(n.createdAt)}{n.updatedAt && ' (edited)'}</p>
                  <button className="mr-3 mt-1 underline" onClick={() => setEdit({ id: n._id, text: n.text })}>Edit</button>
                  <button className="text-red-700 underline" onClick={() => run(`/enquiries/${id}/notes/${n._id}`, { method: 'DELETE' })}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
        <textarea aria-label="New note" className="input mt-3" rows={3} placeholder="Add follow-up note about this customer..." value={note} onChange={(x) => setNote(x.target.value)} />
        <button className="btn btn-dark mt-2 !py-2 text-sm" onClick={() => run(`/enquiries/${id}/notes`, { method: 'POST', body: { text: note } }).then(() => setNote(''))}>Add note</button>
        {err && <p role="alert" className="mt-3 text-sm text-red-700">{err}</p>}

        <h3 className="mt-8 font-display text-lg font-semibold">Activity History</h3>
        <ul className="mt-2 space-y-1 text-xs text-dusk/70">
          {[...e.history].reverse().map((h) => <li key={h._id}>{fmt(h.at)}: {h.action}</li>)}
        </ul>

        <button
          className="mt-10 text-sm text-red-700 underline"
          onClick={async () => {
            if (confirm('Delete this enquiry permanently?')) {
              await adm('/enquiries/' + id, { method: 'DELETE' });
              onChange();
              onClose();
            }
          }}
        >
          Delete enquiry
        </button>
      </aside>
    </div>
  );
}
