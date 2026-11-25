'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mediaUrl } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

export default function LayoutPhoto({ s }) {
  const wrap = useRef(null), section = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: '+=120%', scrub: 0.6, pin: true, anticipatePin: 1 } });
      tl.fromTo('.lp-img', { scale: 1.05, yPercent: 0, rotationX: 8 }, { scale: 1.3, yPercent: -6, rotationX: 0, ease: 'none' }, 0)
        .fromTo('.lp-text', { opacity: 1, y: 0 }, { opacity: 0, y: -40, ease: 'none' }, 0.65);
    }, wrap);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={wrap}>
      <section ref={section} className="relative h-[100svh] overflow-hidden bg-dusk text-white" style={{ perspective: '1200px' }}>
        <img src={mediaUrl(s.image)} alt="" className="lp-img absolute inset-0 h-full w-full object-cover will-change-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-dusk/85 via-dusk/40 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-dusk/70 via-transparent to-dusk/30" aria-hidden="true" />
        <div className="lp-text relative mx-auto max-w-7xl px-5 pt-28 md:px-10">
          <p className="mb-4 text-sm text-marigold">{s.label}</p>
          <h2 className="display max-w-2xl text-5xl md:text-7xl">{s.headline}</h2>
          <p className="mt-6 max-w-md text-white/85">{s.text}</p>
        </div>
      </section>
    </div>
  );
}