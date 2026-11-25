'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { mediaUrl } from '@/lib/api';

const TONE = {
  Available: 'bg-field text-white',
  Reserved: 'bg-marigold text-dusk',
  Sold: 'bg-dusk/80 text-white',
};
const FILTERS = ['All', 'Available', 'Reserved', 'Sold'];

function Photo({ src, title, className }) {
  if (src) return <img src={mediaUrl(src)} alt={title} loading="lazy" className={className} />;
  return (
    <div className={`${className} grid place-items-center bg-gradient-to-br from-field via-dusk to-dusk font-display text-7xl text-white/20`} aria-hidden="true">
      {title?.[0] || 'V'}
    </div>
  );
}

function Card({ p, i, onOpen, onSelectPlot }) {
  const ref = useRef(null);
  const move = (e) => {
    if (!window.matchMedia('(hover: hover)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };
  const status = p.availability === 'Booked' ? 'Reserved' : p.availability;

  return (
    <article className="card-in group relative" style={{ animationDelay: `${i * 55}ms` }}>
      <div ref={ref} onMouseMove={move} onMouseLeave={leave} className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/85 backdrop-blur-md transition-[transform,box-shadow] duration-200 will-change-transform hover:shadow-2xl hover:shadow-dusk/15">
        <div className="relative aspect-[4/3] overflow-hidden bg-fog">
          <Photo src={p.images?.[0]} title={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${TONE[status] || TONE.Available}`}>{status}</span>
            {p.featured && <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-dusk shadow-sm">Featured</span>}
          </div>
          {p.images?.length > 1 && (
            <span className="absolute right-3.5 top-3.5 rounded-full bg-dusk/75 px-3 py-1 text-xs text-white backdrop-blur-sm">
              {p.images.length} photos
            </span>
          )}
          {(p.plotNumber || p.plotCode) && (
            <span className="absolute bottom-3 left-3.5 rounded-lg bg-dusk/80 px-2.5 py-1 text-xs font-semibold tracking-wide text-marigold backdrop-blur-sm">
              {[p.plotNumber && `Plot ${p.plotNumber}`, p.plotCode].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-2xl font-semibold leading-snug">
            <button type="button" data-cursor="Inspect" onClick={() => onOpen(p._id)} className="text-left after:absolute after:inset-0 after:content-['']">
              {p.title}
            </button>
          </h3>
          {p.location && <p className="mt-1 text-sm text-dusk/60">{p.location}</p>}

          {p.features?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.features.slice(0, 3).map((feat) => (
                <span key={feat} className="rounded-md bg-chalk px-2.5 py-1 text-xs font-medium text-dusk/80">
                  {feat}
                </span>
              ))}
              {p.features.length > 3 && <span className="rounded-md bg-chalk px-2 py-1 text-xs text-dusk/60">+{p.features.length - 3}</span>}
            </div>
          )}

          <div className="mt-auto pt-5">
            <div className="grid grid-cols-2 gap-3 border-t border-fog pt-4 text-sm">
              <div>
                <p className="text-xs text-dusk/50">Area {p.dimensions ? '· Size' : ''}</p>
                <p className="font-semibold">{p.area || 'On request'}</p>
                {p.dimensions && <p className="text-xs text-dusk/60">{p.dimensions}</p>}
              </div>
              <div>
                <p className="text-xs text-dusk/50">Price {p.facing ? `· ${p.facing}` : ''}</p>
                <p className="font-semibold text-dusk">{p.price || 'On request'}</p>
              </div>
            </div>
            <div className="relative z-10 mt-4 flex items-center justify-between text-xs font-semibold">
              <button type="button" onClick={() => onOpen(p._id)} className="text-field underline underline-offset-4 hover:text-dusk">
                Inspect details
              </button>
              {status === 'Available' && onSelectPlot && (
                <button type="button" onClick={() => onSelectPlot(p._id)} className="rounded-full bg-dusk px-3.5 py-1.5 text-white transition-colors hover:bg-field">
                  Book plot
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Detail({ list, index, setIndex, onClose, onSelectPlot }) {
  const p = list[index];
  const [img, setImg] = useState(0);
  const closeRef = useRef(null);
  const status = p.availability === 'Booked' ? 'Reserved' : p.availability;

  useEffect(() => setImg(0), [p._id]);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const n = list.length;
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((index + 1) % n);
      if (e.key === 'ArrowLeft') setIndex((index - 1 + n) % n);
    };
    window.addEventListener('keydown', key);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', key);
      document.documentElement.style.overflow = '';
    };
  }, [index, list.length, onClose, setIndex]);

  const images = p.images || [];
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-dusk/80 p-3 backdrop-blur-sm md:p-6" onClick={onClose} data-lenis-prevent>
      <div className="modal-in relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow hover:bg-marigold">
          Close
        </button>
        <div role="dialog" aria-modal="true" aria-label={p.title} className="grid max-h-[92svh] overflow-y-auto overscroll-contain rounded-3xl bg-chalk md:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-[260px] bg-dusk md:min-h-[540px]">
            <Photo src={images[img]} title={p.title} className="absolute inset-0 h-full w-full object-cover" />
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-dusk/85 to-transparent p-4 pt-10">
                {images.map((u, k) => (
                  <button
                    key={u + k}
                    onClick={() => setImg(k)}
                    aria-label={`Show photo ${k + 1}`}
                    aria-current={k === img}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${k === img ? 'border-marigold' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={mediaUrl(u)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE[status] || TONE.Available}`}>{status}</span>
              {p.plotNumber && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-dusk">Plot {p.plotNumber}</span>}
              {p.plotCode && <span className="rounded-full bg-white px-3 py-1 text-xs text-dusk/70">ID: {p.plotCode}</span>}
            </div>
            <h3 className="display mt-4 text-3xl md:text-5xl">{p.title}</h3>
            {p.location && <p className="mt-2 text-dusk/65">{p.location}</p>}

            <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-fog py-5">
              <div><dt className="text-xs text-dusk/50">Total Area</dt><dd className="font-display text-xl md:text-2xl">{p.area || 'On request'}</dd></div>
              <div><dt className="text-xs text-dusk/50">Price</dt><dd className="font-display text-xl md:text-2xl">{p.price || 'On request'}</dd></div>
              {p.dimensions && <div><dt className="text-xs text-dusk/50">Dimensions</dt><dd className="font-semibold">{p.dimensions}</dd></div>}
              {p.facing && <div><dt className="text-xs text-dusk/50">Facing</dt><dd className="font-semibold">{p.facing}</dd></div>}
            </dl>

            {p.description && <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-dusk/80 md:text-base">{p.description}</p>}

            {p.features?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-dusk/50">Plot Amenities & Highlights</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.features.map((feat) => (
                    <span key={feat} className="rounded-lg border border-fog bg-white px-3 py-1 text-xs font-medium text-dusk">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {status === 'Available' ? (
                <>
                  {onSelectPlot && (
                    <button
                      type="button"
                      onClick={() => { onClose(); onSelectPlot(p._id); }}
                      className="btn btn-dark"
                    >
                      Book / Enquire About This Plot
                    </button>
                  )}
                  <Link href={`/book-a-visit?plot=${p._id}`} className="btn border border-dusk text-dusk hover:bg-dusk hover:text-white">
                    Open Booking Page
                  </Link>
                </>
              ) : (
                <Link href="/book-a-visit" className="btn btn-dark">Ask about similar plots</Link>
              )}
            </div>

            {list.length > 1 && (
              <div className="mt-auto flex items-center justify-between pt-8 text-sm">
                <button onClick={() => setIndex((index - 1 + list.length) % list.length)} className="underline underline-offset-4 hover:text-field">Previous plot</button>
                <span className="text-dusk/50">{index + 1} of {list.length}</span>
                <button onClick={() => setIndex((index + 1) % list.length)} className="underline underline-offset-4 hover:text-field">Next plot</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlotsExplorer({ plots = [], s }) {
  const [filter, setFilter] = useState('All');
  const [openId, setOpenId] = useState(null);
  const lastFocus = useRef(null);

  const normalizedPlots = useMemo(
    () => plots.map((p) => ({ ...p, availability: p.availability === 'Booked' ? 'Reserved' : p.availability })),
    [plots]
  );

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f, f === 'All' ? normalizedPlots.length : normalizedPlots.filter((p) => p.availability === f).length])),
    [normalizedPlots]
  );
  const list = useMemo(
    () => (filter === 'All' ? normalizedPlots : normalizedPlots.filter((p) => p.availability === filter)),
    [normalizedPlots, filter]
  );
  const index = list.findIndex((p) => p._id === openId);

  const open = (id) => { lastFocus.current = document.activeElement; setOpenId(id); };
  const close = () => { setOpenId(null); lastFocus.current?.focus?.(); };

  const selectForBooking = (plotId) => {
    window.dispatchEvent(new CustomEvent('vistara:select-plot', { detail: { plotId } }));
    const el = document.getElementById('book-visit');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = `/book-a-visit?plot=${plotId}`;
    }
  };

  return (
    <section id="plots" className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p data-reveal className="mb-4 text-sm font-semibold uppercase tracking-wider text-field">{s.label}</p>
          <h2 data-reveal className="display text-4xl md:text-6xl">{s.headline}</h2>
          {s.text && <p data-reveal className="mt-6 text-lg text-dusk/75">{s.text}</p>}
        </div>

        {normalizedPlots.length > 0 && (
          <div data-reveal className="flex flex-wrap gap-2" role="group" aria-label="Filter plots by availability">
            {FILTERS.filter((f) => f === 'All' || counts[f] > 0).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${filter === f ? 'border-dusk bg-dusk text-white' : 'border-fog bg-white hover:border-dusk'}`}
              >
                {f} <span className={filter === f ? 'text-marigold' : 'text-dusk/40'}>{counts[f]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {normalizedPlots.length === 0 ? (
        <div className="mt-14 rounded-3xl border border-fog bg-white p-10 md:p-16">
          <p className="font-display text-3xl">New plots are being added.</p>
          <p className="mt-3 max-w-md text-dusk/70">Book a site visit and our team will share upcoming inventory and site layout details.</p>
          <Link href="/#book-visit" className="btn btn-dark mt-6">Book a site visit</Link>
        </div>
      ) : (
        <>
          <p data-reveal className="mt-10 text-sm font-medium text-dusk/65">
            Showing {list.length} {list.length === 1 ? 'plot' : 'plots'} · {counts.Available} available right now. Click any card for dimensions, gallery & booking.
          </p>
          <div key={filter} className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => <Card key={p._id} p={p} i={i} onOpen={open} onSelectPlot={selectForBooking} />)}
          </div>
        </>
      )}

      {index >= 0 && <Detail list={list} index={index} setIndex={(i) => setOpenId(list[i]._id)} onClose={close} onSelectPlot={selectForBooking} />}
    </section>
  );
}
