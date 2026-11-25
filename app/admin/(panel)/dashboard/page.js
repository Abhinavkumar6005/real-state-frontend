'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adm } from '@/lib/api';

const STATUSES = ['Pending', 'Contacted', 'Interested', 'Visit Scheduled', 'Completed'];

const StatCard = ({ n, l, accent }) => (
  <div className="rounded-2xl border border-fog bg-white p-5 shadow-sm">
    <p className={`font-display text-4xl font-bold ${accent || 'text-dusk'}`}>{n}</p>
    <p className="mt-1 text-sm text-dusk/65">{l}</p>
  </div>
);

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { adm('/stats').then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <p role="alert" className="text-red-700">{err}</p>;
  if (!s) return <p>Loading...</p>;
  const cs = s.contentStatus;
  const c = s.construction || {};

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/plots" className="btn btn-dark !py-2.5 text-sm">Manage Plots</Link>
          <Link href="/admin/construction" className="btn border border-dusk !py-2.5 text-sm hover:bg-dusk hover:text-white">Update Construction 3D</Link>
        </div>
      </div>

      {/* Plot Inventory Overview */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dusk/55">Plot Inventory</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard n={s.plots.total ?? 0} l="Total plots" />
          <StatCard n={s.plots.available ?? 0} l="Available plots" accent="text-field" />
          <StatCard n={s.plots.reserved ?? 0} l="Reserved plots" accent="text-amber-600" />
          <StatCard n={s.plots.sold ?? 0} l="Sold plots" accent="text-dusk/60" />
        </div>
      </section>

      {/* Enquiry Overview */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dusk/55">Customer Enquiries & Visits</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard n={s.total} l="Total enquiries" />
          <StatCard n={s.byStatus.Pending || 0} l="Pending enquiries" accent="text-amber-600" />
          <StatCard n={s.byStatus['Visit Scheduled'] || 0} l="Scheduled site visits" accent="text-field" />
          <StatCard n={s.last7} l="New in last 7 days" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-fog bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent enquiries</h2>
            <Link href="/admin/enquiries" className="text-sm font-semibold text-field underline underline-offset-4">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-fog">
            {s.recent.length === 0 && (
              <li className="py-4 text-sm text-dusk/60">No enquiries yet. They will appear here when visitors submit the booking form.</li>
            )}
            {s.recent.map((e) => (
              <li key={e._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <span className="font-semibold">{e.name}</span>
                  {e.plotTitle && <span className="ml-2 rounded bg-chalk px-2 py-0.5 text-xs text-dusk/75">{e.plotTitle}</span>}
                  <div className="text-xs text-dusk/55">
                    {e.phone} · Visit: {new Date(e.visitDate).toLocaleDateString()}
                  </div>
                </div>
                <span className="rounded-full bg-chalk px-3 py-1 text-xs font-semibold">{e.status}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-fog pt-4 text-xs text-dusk/60">
            {STATUSES.map((x) => `${x}: ${s.byStatus[x] || 0}`).join('  ·  ')}
          </p>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-fog bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">3D Construction Status</h2>
              <span className="font-display text-2xl font-bold text-field">{c.overallProgress ?? 0}%</span>
            </div>
            <p className="mt-1 text-sm text-dusk/70">{c.currentPhase}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-fog">
              <div className="h-full rounded-full bg-field" style={{ width: `${c.overallProgress ?? 0}%` }} />
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-dusk/80">
              <li>Completed zones: <strong>{c.completedZones ?? 0}</strong></li>
              <li>Under construction: <strong>{c.underConstructionZones ?? 0}</strong></li>
              <li>Upcoming zones: <strong>{c.upcomingZones ?? 0}</strong></li>
            </ul>
            <Link href="/admin/construction" className="mt-4 inline-block text-sm font-semibold text-field underline underline-offset-4">
              Update 3D progress & photos
            </Link>
          </section>

          <section className="rounded-2xl border border-fog bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Website status</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Published plots: <strong>{s.plots.published}</strong> ({s.plots.draft} drafts · {s.plots.featured} featured)</li>
              <li>Hero video: <strong>{cs.heroVideoSet ? 'Custom set' : 'Default local video'}</strong></li>
              <li>Contact details: <strong>{cs.contactSet ? 'Set' : 'Not set'}</strong></li>
              <li>Content last edited: <strong>{cs.lastEdited ? new Date(cs.lastEdited).toLocaleString() : 'Using defaults'}</strong></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
