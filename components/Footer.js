import Link from 'next/link';
import { mediaUrl } from '@/lib/api';

export default function Footer({ c }) {
  const { info, social } = c.contact;
  const logoSrc = c.brand.logo ? mediaUrl(c.brand.logo) : '/logo.svg';

  return (
    <footer className="relative overflow-hidden bg-dusk text-white">
      {/* Subtle radial ambient gradients inside footer */}
      <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-field/25 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-marigold/15 blur-[130px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        {/* Elevated Glassmorphic Footer CTA Banner */}
        <div className="glass-dark flex flex-col justify-between gap-8 rounded-3xl p-8 md:flex-row md:items-center md:p-12">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-marigold">
              Private Site Walkthrough
            </p>
            <p className="display text-3xl md:text-5xl">{c.footer.cta}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/book-a-visit" data-cursor="Book" className="btn btn-primary">
              Book a site visit
            </Link>
            <Link href="/#plots" data-cursor="Plots" className="btn btn-ghost">
              Explore plots
            </Link>
          </div>
        </div>

        {/* Structured Footer Grid */}
        <div className="mt-16 grid gap-10 border-t border-white/15 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <img src={logoSrc} alt="" className="h-10 w-10 rounded-xl object-contain" />
              <span className="font-display text-2xl font-bold tracking-tight">{c.brand.name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{c.footer.line}</p>
            {social.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {social.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-marigold hover:text-marigold"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Footer navigation" className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-marigold">Explore</p>
            <ul className="space-y-2.5 text-white/75">
              <li><Link href="/" className="transition-colors hover:text-white">Home</Link></li>
              <li><Link href="/#layout-3d" className="transition-colors hover:text-white">Interactive 3D Layout</Link></li>
              <li><Link href="/#construction" className="transition-colors hover:text-white">Construction Progress</Link></li>
              <li><Link href="/#plots" className="transition-colors hover:text-white">Available Plots</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-white">About Development</Link></li>
            </ul>
          </nav>

          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-marigold">Site Office & Contact</p>
            <div className="space-y-2.5 text-white/80">
              {info.phone && (
                <p>
                  <a href={`tel:${info.phone.replace(/[^+\d]/g, '')}`} className="font-semibold text-white hover:text-marigold">
                    {info.phone}
                  </a>
                </p>
              )}
              {info.email && (
                <p>
                  <a href={`mailto:${info.email}`} className="underline underline-offset-4 hover:text-marigold">
                    {info.email}
                  </a>
                </p>
              )}
              {info.address && <p className="whitespace-pre-line text-white/70">{info.address}</p>}
              {!info.phone && !info.email && !info.address && (
                <p className="text-white/65">Use our online booking form to request a callback or site tour.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-marigold">Guided Tours</p>
            <p className="mt-2 font-display text-lg font-semibold">Open 7 Days a Week</p>
            <p className="mt-1 text-white/70">9:30 AM – 6:30 PM · On-site document review and plot boundary walk.</p>
            <Link href="/#book-visit" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-marigold hover:underline">
              Reserve your slot <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-8 text-xs text-white/55">
          <p>© {new Date().getFullYear()} {c.brand.name}. All rights reserved.</p>
          <a href="#main" className="rounded-full border border-white/15 px-4 py-1.5 text-white/75 transition-colors hover:border-marigold hover:text-marigold">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
