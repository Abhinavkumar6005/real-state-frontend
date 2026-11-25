'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mediaUrl } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

const formatDate = (d) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(d));

const STATUS_BADGE = {
  Completed: 'bg-field text-white',
  'Under Construction': 'bg-marigold text-dusk',
  Upcoming: 'bg-fog text-dusk',
};

const BAR_COLOR = {
  Completed: 'bg-field',
  'Under Construction': 'bg-marigold',
  Upcoming: 'bg-dusk/25',
};

export default function ConstructionProgress({ s, construction }) {
  const [lightbox, setLightbox] = useState(null);
  const [slideProgress, setSlideProgress] = useState(0);
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const zones = construction?.zones || [];
  const updates = construction?.updates || [];
  const gallery = construction?.gallery || [];

  useEffect(() => {
    if (!zones.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const section = sectionRef.current;
      if (!track || !viewport || !section) return;

      const getDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      gsap.fromTo(
        track,
        { x: 40 },
        {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'bottom 35%',
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => setSlideProgress(Math.round(self.progress * 100)),
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [zones.length]);

  if (!construction) return null;

  const completed = zones.filter((z) => z.status === 'Completed');
  const ongoing = zones.filter((z) => z.status === 'Under Construction');
  const upcoming = zones.filter((z) => z.status === 'Upcoming');

  const allPhotos = [
    ...(construction.architecturalPlanImage
      ? [{ url: construction.architecturalPlanImage, caption: 'Official Site Masterplan / Architectural Plan', stage: 'Blueprint' }]
      : []),
    ...gallery,
    ...zones.flatMap((z) => (z.photos || []).map((url) => ({ url, caption: `${z.name} (${z.status})`, stage: z.status }))),
    ...updates.flatMap((u) => (u.photos || []).map((url) => ({ url, caption: `${u.title} (${u.status})`, stage: u.status }))),
  ];

  return (
    <section id="construction" ref={sectionRef} className="relative z-20 border-y border-white/60 bg-white/90 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p data-reveal className="mb-4 text-sm font-semibold uppercase tracking-wider text-field">{s.label}</p>
            <h2 data-reveal className="display text-4xl md:text-6xl">{s.headline}</h2>
            {s.text && <p data-reveal className="mt-6 max-w-2xl text-lg text-dusk/75">{s.text}</p>}
          </div>

          <div data-reveal className="rounded-3xl border border-fog bg-chalk p-6 md:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dusk/55">Overall Site Progress</p>
                <p className="mt-1 font-display text-xl font-semibold text-dusk">{construction.currentPhase}</p>
              </div>
              <span className="font-display text-4xl font-bold text-field">{construction.overallProgress}%</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-fog">
              <div className="h-full rounded-full bg-gradient-to-r from-field to-marigold transition-all duration-700" style={{ width: `${construction.overallProgress}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl bg-white p-3">
                <p className="font-display text-2xl font-bold text-field">{completed.length}</p>
                <p className="text-dusk/65">Completed</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="font-display text-2xl font-bold text-dusk">{ongoing.length}</p>
                <p className="text-dusk/65">In Progress</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="font-display text-2xl font-bold text-dusk/55">{upcoming.length}</p>
                <p className="text-dusk/65">Upcoming</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-Driven Horizontal Zone Progress Slider */}
      {zones.length > 0 && (
        <div className="mt-14">
          <div className="mx-auto max-w-7xl px-5 py-4 md:px-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-field" />
                <p className="text-xs font-semibold uppercase tracking-widest text-dusk/65">
                  Scroll to glide across all {zones.length} site zones
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-fog">
                  <div className="h-full rounded-full bg-dusk transition-all duration-150" style={{ width: `${slideProgress}%` }} />
                </div>
                <span className="text-xs font-semibold text-dusk/60">{slideProgress}%</span>
              </div>
            </div>

            <div ref={viewportRef} className="overflow-hidden">
              <div ref={trackRef} className="flex w-max gap-6 will-change-transform">
                {zones.map((z, idx) => (
                  <article
                    key={z._id || z.code}
                    className="flex w-[82vw] shrink-0 flex-col justify-between rounded-3xl border border-fog bg-chalk p-7 shadow-sm transition-shadow hover:shadow-xl sm:w-[360px] md:w-[390px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-dusk/55">
                          0{idx + 1} · {z.category}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[z.status] || STATUS_BADGE.Upcoming}`}>
                          {z.status}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-semibold leading-snug">{z.name}</h3>
                      {z.description && <p className="mt-3 text-sm leading-relaxed text-dusk/75">{z.description}</p>}

                      {z.photos?.[0] && (
                        <button
                          type="button"
                          onClick={() => setLightbox({ url: z.photos[0], caption: `${z.name} (${z.status})`, stage: z.status })}
                          className="mt-4 block w-full overflow-hidden rounded-2xl bg-dusk"
                        >
                          <img src={mediaUrl(z.photos[0])} alt={z.name} className="h-36 w-full object-cover transition-transform duration-500 hover:scale-105" />
                        </button>
                      )}
                    </div>

                    <div className="mt-6 border-t border-fog pt-4">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Completion</span>
                        <span className="text-field">{z.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-fog">
                        <div className={`h-full rounded-full transition-all duration-500 ${BAR_COLOR[z.status] || BAR_COLOR.Upcoming}`} style={{ width: `${z.progress}%` }} />
                      </div>
                      {z.targetDate && <p className="mt-3 text-xs font-medium text-dusk/55">{z.targetDate}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updates timeline + Real Site Photos */}
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div data-reveal className="rounded-3xl border border-fog bg-chalk p-7 md:p-9">
            <h3 className="font-display text-2xl font-semibold">Engineering Milestone Log</h3>
            <p className="mt-1 text-sm text-dusk/65">Verified updates published directly from site administration.</p>
            <ol className="mt-6 space-y-5 border-l-2 border-fog pl-5">
              {updates.length === 0 && <li className="text-sm text-dusk/60">Milestone updates will appear here as work progresses.</li>}
              {updates.map((u, idx) => (
                <li key={u._id || idx} className="relative">
                  <span className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${u.status === 'Completed' ? 'bg-field' : u.status === 'Under Construction' ? 'bg-marigold' : 'bg-dusk/40'}`} />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-0.5 font-semibold ${STATUS_BADGE[u.status] || STATUS_BADGE.Upcoming}`}>{u.status}</span>
                    {u.area && <span className="font-semibold text-dusk/65">{u.area}</span>}
                    {u.date && <span className="text-dusk/45">{formatDate(u.date)}</span>}
                  </div>
                  <h4 className="mt-1.5 font-display text-lg font-semibold">{u.title}</h4>
                  {u.description && <p className="mt-1 text-sm text-dusk/75">{u.description}</p>}
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="rounded-3xl border border-fog bg-chalk p-7 md:p-9">
            <h3 className="font-display text-2xl font-semibold">Actual Site Photographs & Plans</h3>
            <p className="mt-1 text-sm text-dusk/65">Unedited site documentation & architectural layout references uploaded by the admin.</p>
            {allPhotos.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-dusk/25 bg-white p-8 text-center">
                <p className="font-display text-lg font-semibold text-dusk">No site photographs uploaded yet</p>
                <p className="mt-2 text-sm text-dusk/65">
                  We never show fictional stock renders here. Real site photos and architectural plans uploaded in the Admin Construction panel appear automatically.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
               {allPhotos.slice(0, 9).map((ph, i) => (
  <button
    key={ph.url + i}
    type="button"
    onClick={() => setLightbox(ph)}
    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-dusk text-left"
  >
    <img
      src={mediaUrl(ph.url)}
      alt={ph.caption || 'Site photograph'}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dusk/90 to-transparent p-2.5 pt-6 text-xs font-medium text-white">
      {ph.stage || 'Site Photo'}
    </span>
  </button>
))}
              </div>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-dusk/90 p-4 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute right-3 top-3 rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow hover:bg-marigold">Close</button>
            <img src={mediaUrl(lightbox.url)} alt={lightbox.caption || 'Site photo'} className="max-h-[75svh] w-full bg-dusk object-contain" />
            <div className="p-4 text-sm">
              <span className="font-semibold text-field">{lightbox.stage}</span>
              {lightbox.caption && <span className="ml-2 text-dusk/80">— {lightbox.caption}</span>}
              {lightbox.takenAt && <span className="ml-2 text-dusk/50">({lightbox.takenAt})</span>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
