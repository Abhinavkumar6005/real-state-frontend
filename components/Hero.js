'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mediaUrl } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

const ytId = (u = '') => {
  const m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
};

export default function Hero({ h, stats = [], overallProgress }) {
  const id = ytId(h.videoUrl);
  const customVideo = !id && h.videoUrl ? mediaUrl(h.videoUrl) : '';
  const root = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.hw', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.08, delay: 0.1 });
      gsap.from('.hfade', { opacity: 0, y: 22, duration: 0.9, ease: 'power2.out', stagger: 0.1, delay: 0.55 });
      gsap.to('.hvideo', { scale: 1, duration: 2.4, ease: 'power2.out' });
      gsap.to('.hparallax', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const words = (h.headline || '').split(' ');
  const availableCount = stats?.availableCount;
  const totalCount = stats?.totalCount;

  return (
    <section ref={root} className="relative flex min-h-[100svh] items-end overflow-hidden bg-dusk text-white">
      <div className="hparallax absolute inset-0" aria-hidden="true">
        {id ? (
          <div className="hvideo absolute inset-0 scale-110 overflow-hidden">
            <iframe
              title="Background video"
              tabIndex={-1}
              allow="autoplay; encrypted-media"
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3`}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
              style={{ width: 'max(100%, 177.78svh)', height: 'max(100%, 56.25vw)' }}
            />
          </div>
        ) : (
          <video
            className="hvideo absolute inset-0 h-full w-full scale-110 object-cover"
            src={customVideo || '/hero.mp4'}
            poster={h.poster ? mediaUrl(h.poster) : '/home.jpg'}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/45 to-dusk/35" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-dusk/75 via-transparent to-transparent" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-end gap-10 px-5 pb-14 pt-36 md:px-10 md:pb-20 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="hfade mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-marigold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-marigold" />
            {h.eyebrow}
          </p>
          <h1 className="display text-[clamp(2.85rem,8vw,6.8rem)]" aria-label={h.headline}>
            {words.map((w, i) => (
              <span key={i} className="mr-[0.24em] inline-block overflow-hidden align-bottom">
                <span className="hw inline-block" aria-hidden="true">{w}</span>
              </span>
            ))}
          </h1>
          <p className="hfade mt-7 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">{h.text}</p>
          <div className="hfade mt-9 flex flex-wrap gap-4">
            <Link href={h.primaryCta?.href || '/#plots'} className="btn btn-primary">{h.primaryCta?.label || 'Explore plots'}</Link>
            <Link href={h.secondaryCta?.href || '/#book-visit'} className="btn btn-ghost">{h.secondaryCta?.label || 'Book a visit'}</Link>
          </div>
        </div>

        <div className="hfade glass-dark flex flex-col gap-4 rounded-2xl p-5 shadow-2xl lg:w-80">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/65">Live Site Status</span>
            <span className="rounded-full bg-field/80 px-2.5 py-0.5 text-xs font-semibold text-white">Verified</span>
          </div>
          {typeof overallProgress === 'number' && (
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-white/80">Infrastructure Progress</span>
                <span className="font-display text-xl font-bold text-marigold">{overallProgress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-marigold transition-all duration-700" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          )}
          {typeof totalCount === 'number' && totalCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Plots Ready to Explore</span>
              <span className="font-semibold text-white">{availableCount} / {totalCount} Available</span>
            </div>
          )}
          <Link href="/#layout-3d" className="inline-flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marigold hover:text-dusk">
            <span>Inspect 3D Masterplan</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
