import BookingForm from '@/components/BookingForm';
import SiteVisitAside from '@/components/SiteVisitAside';
import { getContent, getPlots, getConstruction } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { seo } = await getContent();
  return { title: seo.book.title, description: seo.book.description, alternates: { canonical: '/book-a-visit' } };
}

export default async function Book({ searchParams }) {
  const [{ contact: k }, plots, construction] = await Promise.all([getContent(), getPlots(), getConstruction()]);
  const plot = plots.find((p) => p._id === searchParams?.plot);
  const availableCount = plots.filter((p) => p.availability === 'Available').length;

  return (
    <>
      {/* Hero Banner with Real Estate Architectural Wallpaper */}
      <section className="relative overflow-hidden bg-dusk pb-24 pt-44 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/book-wallpaper.jpg')" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-dusk/95 via-dusk/80 to-dusk/45" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dusk via-transparent to-dusk/60" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-dusk/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-marigold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-marigold" />
            Private Site Tour & Reservation
          </p>
          <h1 className="display max-w-4xl text-[clamp(2.8rem,8vw,6.8rem)]">{k.hero.headline}</h1>
          <p className="mt-7 max-w-2xl text-lg text-white/85">{k.hero.text}</p>
        </div>
      </section>

      {/* Booking Form & Site Walkthrough Section over subtle themed wallpaper */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/book-wallpaper.jpg')" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-chalk/85 via-chalk/75 to-chalk/90" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <div className="glass rounded-3xl p-7 shadow-xl md:p-10">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{k.form.heading}</h2>
            <p className="mt-2 text-dusk/75">{k.form.text}</p>
            {plot && (
              <p className="mt-4 rounded-xl border border-fog bg-white/90 px-4 py-3 text-sm">
                Enquiring about <strong>{plot.title}</strong>
                {plot.plotNumber ? ` (Plot ${plot.plotNumber})` : ''}
                {plot.location ? `, ${plot.location}` : ''}
              </p>
            )}
            <BookingForm plotId={plot?._id || ''} plots={plots} success={k.form.success} error={k.form.error} />
          </div>

          <SiteVisitAside
            info={k.info}
            availableCount={availableCount}
            totalCount={plots.length}
            overallProgress={construction?.overallProgress}
          />
        </div>
      </section>
    </>
  );
}
