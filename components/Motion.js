'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Smooth Lenis scrolling + reliable IntersectionObserver/GSAP reveals (never leaves elements stuck invisible).
export default function Motion() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__vistaraLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const revealed = new WeakSet();
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal], [data-reveal-3d]'));
    const staggerContainers = Array.from(document.querySelectorAll('[data-stagger]'));

    // Set initial subtle hidden state only for elements currently below the fold
    const isInOrAboveView = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.96;
    };

    const animateIn = (targets, stagger = 0) => {
      const list = Array.from(targets).filter((el) => !revealed.has(el));
      if (!list.length) return;
      list.forEach((el) => revealed.add(el));
      gsap.fromTo(
        list,
        { y: 26, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    };

    revealTargets.forEach((el) => {
      if (!isInOrAboveView(el)) gsap.set(el, { opacity: 0, y: 26 });
    });
    staggerContainers.forEach((wrap) => {
      const items = wrap.querySelectorAll('[data-stagger-item]');
      if (!isInOrAboveView(wrap)) gsap.set(items, { opacity: 0, y: 26 });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.hasAttribute('data-stagger')) {
            animateIn(el.querySelectorAll('[data-stagger-item]'), 0.08);
          } else {
            animateIn([el]);
          }
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px 60px 0px', threshold: 0 }
    );

    const checkVisible = () => {
      revealTargets.forEach((el) => {
        if (!revealed.has(el) && isInOrAboveView(el)) {
          animateIn([el]);
          io.unobserve(el);
        }
      });
      staggerContainers.forEach((wrap) => {
        if (isInOrAboveView(wrap)) {
          animateIn(wrap.querySelectorAll('[data-stagger-item]'), 0.08);
          io.unobserve(wrap);
        }
      });
    };

    revealTargets.forEach((el) => {
      if (!isInOrAboveView(el)) io.observe(el);
    });
    staggerContainers.forEach((wrap) => {
      if (!isInOrAboveView(wrap)) io.observe(wrap);
    });

    lenis.on('scroll', checkVisible);
    window.addEventListener('scroll', checkVisible, { passive: true });

    // Parallax images
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: el, scrub: true },
        });
      });
    });

    const t1 = setTimeout(() => {
      ScrollTrigger.refresh();
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) lenis.scrollTo(target, { duration: 1.15, offset: -72 });
      }
    }, 400);

    return () => {
      clearTimeout(t1);
      if (window.__vistaraLenis === lenis) window.__vistaraLenis = null;
      window.removeEventListener('scroll', checkVisible);
      io.disconnect();
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      // Ensure nothing stays invisible on route change
      revealTargets.forEach((el) => gsap.set(el, { clearProps: 'transform,opacity' }));
      staggerContainers.forEach((w) => gsap.set(w.querySelectorAll('[data-stagger-item]'), { clearProps: 'transform,opacity' }));
    };
  }, [path]);

  return null;
}
