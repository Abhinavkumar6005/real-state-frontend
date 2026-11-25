import Hero from '@/components/Hero';
import Layout3DScroll from '@/components/Layout3DScrollLazy';
import Layout3D from '@/components/Layout3DLazy';
import PlotsExplorer from '@/components/PlotsExplorer';
import ConstructionProgress from '@/components/ConstructionProgress';
import Testimonials from '@/components/Testimonials';
import BookingForm from '@/components/BookingForm';
import SiteVisitAside from '@/components/SiteVisitAside';
import { getContent, getPlots, getConstruction } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { seo } = await getContent();
  return { title: seo.home.title, description: seo.home.description, alternates: { canonical: '/' } };
}

const Wrap = ({ children, className = '', id }) => (
  <section id={id} className={`mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32 ${className}`}>{children}</section>
);

const Head = ({ s, dark }) => (
  <div className="max-w-3xl">
    <p data-reveal className={`mb-4 text-sm font-semibold uppercase tracking-wider ${dark ? 'text-marigold' : 'text-field'}`}>{s.label}</p>
    <h2 data-reveal className="display text-4xl md:text-6xl">{s.headline}</h2>
    {s.text && <p data-reveal className={`mt-6 text-lg ${dark ? 'text-white/80' : 'text-dusk/75'}`}>{s.text}</p>}
  </div>
);

export default async function Home({ searchParams }) {
  const [c, plots, construction] = await Promise.all([getContent(), getPlots(), getConstruction()]);
  const h = c.home;
  const k = c.contact;
  const availableCount = plots.filter((p) => p.availability === 'Available').length;

  return (
    <>
      <Hero
        h={h.hero}
        overallProgress={construction?.overallProgress}
        stats={{ availableCount, totalCount: plots.length }}
      />

      {/* About the development */}
      <Wrap id="about-project">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Head s={h.intro} />
          {h.aboutStats?.length > 0 && (
            <dl data-stagger data-scroll-3d className="grid grid-cols-2 gap-4">
              {h.aboutStats.map((st) => (
                <div key={st.label} data-stagger-item className="glass rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-dusk/55">{st.label}</dt>
                  <dd className="mt-2 font-display text-2xl font-bold text-dusk md:text-3xl">{st.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Wrap>

      {/* Scroll-Triggered 3D Site Walkthrough (rises & orbits on scroll) */}
      <Layout3DScroll s={h.layout} />

      {/* Interactive 3D Project & Construction Visualization */}
      <Layout3D s={h.layout} construction={construction} plots={plots} />

      {/* Real Construction Progress & Engineering Updates */}
      <ConstructionProgress s={h.construction} construction={construction} />

      {/* Dynamic Plots & Featured Properties */}
      <PlotsExplorer plots={plots} s={h.plotsSection} />

      {/* Amenities & Infrastructure (Translucent layer revealing ambient background) */}
      <div className="border-y border-white/60 bg-white/75">
        <Wrap id="amenities">
          <Head s={h.amenities} />
          <ul data-stagger className="mt-14 grid gap-6 sm:grid-cols-2">
            {h.amenities.items.map((a, idx) => (
              <li
                key={a.title}
                data-stagger-item
                className="glass rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-10"
              >
                <span className="font-display text-sm font-bold text-field">0{idx + 1}</span>
                <h3 className="mt-3 font-display text-2xl font-semibold">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-dusk/75">{a.text}</p>
              </li>
            ))}
          </ul>
        </Wrap>
      </div>

      {/* Project Location & Nearby Facilities */}
      <section id="locations" className="relative bg-dusk bg-cover bg-center md:bg-fixed" style={{ backgroundImage: "url('/section-bg.jpg')" }}>
        <div className="absolute inset-0 bg-dusk/75 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="relative text-white">
          <Wrap>
            <Head s={h.locations} dark />
            <dl data-stagger className="mt-14 divide-y divide-white/20 border-y border-white/20">
              {h.locations.items.map((l) => (
                <div key={l.name} data-stagger-item className="grid items-baseline gap-2 py-7 md:grid-cols-[1fr_auto_2fr] md:gap-10">
                  <dt className="font-display text-2xl font-semibold">{l.name}</dt>
                  <dd className="font-display text-3xl text-marigold">{l.distance}</dd>
                  <dd className="text-white/80">{l.text}</dd>
                </div>
              ))}
            </dl>
          </Wrap>
        </div>
      </section>

      {/* Why Buy With Us */}
      <div className="relative overflow-hidden bg-dusk text-white">
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-field/25 blur-[120px]" aria-hidden="true" />
        <Wrap>
          <div className="max-w-3xl">
            <p data-reveal className="mb-4 text-sm font-semibold uppercase tracking-wider text-marigold">{h.why.label}</p>
            <h2 data-reveal className="display text-4xl md:text-6xl">{h.why.headline}</h2>
          </div>
          <div data-stagger className="mt-14 grid gap-8 md:grid-cols-2">
            {h.why.items.map((w) => (
              <div key={w.title} data-stagger-item className="glass-dark rounded-2xl p-8 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="font-display text-2xl font-semibold">{w.title}</h3>
                <p className="mt-3 max-w-md text-white/75">{w.text}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </div>

      {/* Customer Testimonials */}
      <Testimonials s={h.testimonials} />

      {/* Homepage Plot Booking & Site Visit Enquiry Form */}
      <section id="book-visit" className="border-t border-white/60 bg-white/80">
        <Wrap>
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div data-reveal-3d className="glass rounded-3xl p-7 md:p-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-field">{h.booking?.label || 'Book or Enquire'}</p>
              <h2 className="display text-3xl md:text-5xl">{h.booking?.headline || k.form.heading}</h2>
              <p className="mt-3 text-dusk/75">{h.booking?.text || k.form.text}</p>
              <BookingForm
                plotId={searchParams?.plot || ''}
                plots={plots}
                success={k.form.success}
                error={k.form.error}
              />
            </div>

            <SiteVisitAside
              info={k.info}
              availableCount={availableCount}
              totalCount={plots.length}
              overallProgress={construction?.overallProgress}
            />
          </div>
        </Wrap>
      </section>
    </>
  );
}
