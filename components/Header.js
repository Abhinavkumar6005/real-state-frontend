'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { mediaUrl } from '@/lib/api';

const links = [
  { label: 'Home', href: '/', sectionId: 'top' },
  { label: '3D Layout', href: '/#layout-3d', sectionId: 'layout-3d' },
  { label: 'Progress', href: '/#construction', sectionId: 'construction' },
  { label: 'Plots', href: '/#plots', sectionId: 'plots' },
  { label: 'About', href: '/about', sectionId: null },
];

export default function Header({ name, logo }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (path !== '/') return;

      const sections = ['layout-3d', 'construction', 'plots', 'book-visit'];
      const probe = window.innerHeight * 0.42;
      let current = 'top';

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom >= 120) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [path]);

  const handleNavClick = (e, item) => {
    setOpen(false);
    if (item.href === '/about') {
      if (path === '/about') {
        e.preventDefault();
        window.__vistaraLenis
          ? window.__vistaraLenis.scrollTo(0, { duration: 1.0 })
          : window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (item.href === '/') {
      if (path === '/') {
        e.preventDefault();
        setActiveSection('top');
        window.history.pushState(null, '', '/');
        if (window.__vistaraLenis) {
          window.__vistaraLenis.scrollTo(0, { duration: 1.25 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }

    if (item.sectionId && path === '/') {
      e.preventDefault();
      const target = document.getElementById(item.sectionId);
      if (target) {
        setActiveSection(item.sectionId);
        window.history.pushState(null, '', item.href);
        if (window.__vistaraLenis) {
          window.__vistaraLenis.scrollTo(target, {
            duration: 1.3,
            offset: -72,
            easing: (t) => 1 - Math.pow(1 - t, 4),
          });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else if (item.sectionId) {
      e.preventDefault();
      router.push(item.href);
    }
  };

  const isItemActive = (item) => {
    if (path === '/about') return item.href === '/about';
    if (path === '/book-a-visit') return false;
    if (path === '/') {
      if (item.sectionId === 'top') return activeSection === 'top';
      return activeSection === item.sectionId;
    }
    return path === item.href;
  };

  const logoSrc = logo ? mediaUrl(logo) : '/logo.svg';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${scrolled || open ? 'border-b border-white/10 bg-dusk/85 shadow-xl shadow-dusk/10 backdrop-blur-xl' : 'bg-gradient-to-b from-dusk/65 to-transparent'}`}>
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-300 md:px-10 ${scrolled ? 'py-3.5' : 'py-5'}`}>
        <Link href="/" onClick={(e) => handleNavClick(e, links[0])} className="flex items-center gap-2.5 rounded-xl font-display text-xl font-bold tracking-tight">
          <img src={logoSrc} alt="" className="h-9 w-9 rounded-lg object-contain" />
          <span>{name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
          {links.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 ${
                  active
                    ? 'bg-white/12 font-semibold text-marigold shadow-inner shadow-white/5'
                    : 'text-white/85 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-marigold transition-all duration-300 ${
                    active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                  }`}
                />
              </Link>
            );
          })}
          <Link
            href={path === '/' ? '/#book-visit' : '/book-a-visit'}
            onClick={(e) => {
              if (path === '/') handleNavClick(e, { href: '/#book-visit', sectionId: 'book-visit' });
            }}
            className={`ml-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
              path === '/book-a-visit' || activeSection === 'book-visit'
                ? 'bg-white text-dusk shadow-lg'
                : 'bg-marigold text-dusk hover:bg-white'
            }`}
          >
            Book a visit
          </Link>
        </nav>

        <button
          className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm backdrop-blur-md md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-white/10 bg-dusk/95 px-5 pb-6 backdrop-blur-xl md:hidden">
          {links.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`block border-b border-white/10 py-4 font-display text-2xl transition-colors ${active ? 'text-marigold' : 'text-white'}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={path === '/' ? '/#book-visit' : '/book-a-visit'}
            onClick={(e) => handleNavClick(e, { href: path === '/' ? '/#book-visit' : '/book-a-visit', sectionId: path === '/' ? 'book-visit' : null })}
            className="btn btn-primary mt-5 w-full"
          >
            Book a site visit
          </Link>
        </nav>
      )}
    </header>
  );
}
