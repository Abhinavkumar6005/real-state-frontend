import Link from 'next/link';

const VISIT_STEPS = [
  { n: '01', title: 'Boundary & Corner Pegging Walk', text: 'Inspect exact dimensions, road frontage, and plot orientation on-site.' },
  { n: '02', title: 'Live Infrastructure Inspection', text: 'Verify paved roads, drainage lines, water supply, and street lighting.' },
  { n: '03', title: 'Title Deeds & Pricing Review', text: 'Review verified survey maps and itemized pricing with zero pressure.' },
];

export default function SiteVisitAside({ info, availableCount, totalCount, overallProgress }) {
  return (
    <aside data-reveal className="space-y-6">
      <div className="rounded-3xl bg-dusk/95 p-8 text-white shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-marigold">Direct Site Desk</p>
        <h3 className="mt-2 font-display text-3xl font-semibold">{info.heading}</h3>
        <p className="mt-2 text-white/75">{info.text}</p>

        <div className="mt-6 space-y-4 border-t border-white/15 pt-5 text-sm">
          {info.phone && (
            <div>
              <p className="text-xs text-white/50">Phone</p>
              <a
                className="mt-1 inline-block text-xl font-semibold text-marigold underline decoration-2 underline-offset-4 hover:text-white"
                href={`tel:${info.phone.replace(/[^+\d]/g, '')}`}
              >
                {info.phone}
              </a>
            </div>
          )}
          {info.email && (
            <div>
              <p className="text-xs text-white/50">Email</p>
              <a className="mt-1 inline-block text-base underline underline-offset-4 hover:text-marigold" href={`mailto:${info.email}`}>
                {info.email}
              </a>
            </div>
          )}
          {info.address && (
            <div>
              <p className="text-xs text-white/50">Site Office</p>
              <p className="mt-1 whitespace-pre-line text-white/85">{info.address}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
            <span className="font-semibold text-marigold">Open Daily · 9:30 AM – 6:30 PM</span>
            <span className="text-white/70">Private car tour available</span>
          </div>
        </div>
      </div>

      {/* Framed architectural preview + Guided Visit Highlights */}
      <div className="glass overflow-hidden rounded-3xl">
        <div className="relative h-44 overflow-hidden bg-dusk">
          <img src="/about-banner.jpg" alt="Planned estate entrance and tree-lined avenue" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dusk/85 via-dusk/25 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <span className="rounded-full bg-marigold px-3 py-1 text-xs font-bold text-dusk">Guided Site Tour</span>
            {typeof overallProgress === 'number' && (
              <span className="text-xs font-semibold text-white/90">{overallProgress}% Site Built</span>
            )}
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-field">What Happens On Your Visit</p>
          <ul className="mt-4 space-y-4">
            {VISIT_STEPS.map((st) => (
              <li key={st.n} className="flex gap-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-dusk font-display text-xs font-bold text-marigold">
                  {st.n}
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-dusk">{st.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-dusk/70">{st.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-fog pt-4 text-xs">
            {typeof totalCount === 'number' && (
              <span className="font-semibold text-dusk/80">
                {availableCount} of {totalCount} plots available
              </span>
            )}
            <Link href="/#layout-3d" data-cursor="3D" className="font-semibold text-field underline underline-offset-4 hover:text-dusk">
              Inspect 3D Masterplan →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
