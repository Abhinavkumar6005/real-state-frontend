import Link from 'next/link';
import Cta from '@/components/Cta';
import { getContent } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { seo } = await getContent();
  return { title: seo.about.title, description: seo.about.description, alternates: { canonical: '/about' } };
}

export default async function About() {
  const { about: a, home: h } = await getContent();

  return (
    <>
      {/* Hero Banner: Real estate imagery framing left & right sides + existing video subtly layered in center */}
      <section className="relative overflow-hidden bg-dusk pb-24 pt-40 text-white md:pb-32 md:pt-48">
        {/* Left & Right Side Real Estate Background Images */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src="/home.jpg"
            alt=""
            className="absolute inset-y-0 left-0 h-full w-full object-cover opacity-35 md:w-[46%]"
            style={{ maskImage: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)' }}
          />
          <img
            src="/about-banner.jpg"
            alt=""
            className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-55 md:w-[58%]"
            style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 55%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 55%, transparent 100%)' }}
          />
          {/* Existing video kept subtly in the banner center */}
          <video
            src="/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 mx-auto h-full w-full object-cover opacity-25 mix-blend-screen md:w-[62%]"
            style={{ maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.95) 20%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.95) 20%, transparent 78%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/55 to-dusk/75" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-dusk/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-marigold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-marigold" />
            {a.hero.eyebrow}
          </p>
          <h1 className="display max-w-4xl text-[clamp(2.6rem,7.5vw,6.2rem)] drop-shadow-sm">{a.hero.headline}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/90">{a.hero.text}</p>

          {h?.aboutStats?.length > 0 && (
            <dl data-stagger className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
              {h.aboutStats.map((st) => (
                <div key={st.label} data-stagger-item className="glass-dark rounded-2xl p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-white/65">{st.label}</dt>
                  <dd className="mt-2 font-display text-2xl font-bold text-marigold md:text-3xl">{st.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Split Story + Existing Site Video Showcase */}
      <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div data-reveal-3d className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-field">Our Story & Philosophy</span>
            <h2 className="display text-4xl md:text-6xl">{a.story.headline}</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-dusk/80">{a.story.text}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/#layout-3d" data-cursor="3D" className="btn btn-dark">
                Explore 3D Masterplan
              </Link>
              <Link href="/#plots" className="btn border border-dusk/25 bg-white/75 text-dusk backdrop-blur-md hover:border-dusk">
                View Available Plots
              </Link>
            </div>
          </div>

          <div data-reveal-3d className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 p-3 shadow-2xl shadow-dusk/10 backdrop-blur-xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-dusk">
              <video
                src="/hero.mp4"
                poster="/about-banner.jpg"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dusk/80 via-transparent to-transparent" />
              <div className="glass-dark absolute bottom-4 left-4 right-4 rounded-2xl p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-marigold">Built with Transparency</p>
                <p className="mt-1 text-sm text-white/90">Every road, drainage channel, and legal survey is documented before possession.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid on Translucent Surface */}
      <section className="border-y border-white/60 bg-white/75">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-28">
          <div className="max-w-3xl">
            <p data-reveal className="mb-3 text-xs font-semibold uppercase tracking-widest text-field">Core Principles</p>
            <h2 data-reveal className="display text-4xl md:text-6xl">{a.values.headline}</h2>
          </div>

          <ul data-stagger className="mt-14 grid gap-6 sm:grid-cols-2">
            {a.values.items.map((v, idx) => (
              <li
                key={v.title}
                data-stagger-item
                className="group relative overflow-hidden rounded-3xl border border-fog/70 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-dusk font-display text-sm font-bold text-marigold transition-colors group-hover:bg-field group-hover:text-white">
                    0{idx + 1}
                  </span>
                  <span className="ml-4 h-px flex-1 bg-fog" />
                </div>
                <h3 className="font-display text-2xl font-semibold">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-dusk/75">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4-Step Buyer Journey */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <div className="max-w-3xl">
          <p data-reveal className="mb-3 text-xs font-semibold uppercase tracking-widest text-field">How It Works</p>
          <h2 data-reveal className="display text-4xl md:text-6xl">{a.process.headline}</h2>
        </div>

        <ol data-stagger className="mt-14 grid gap-6 md:grid-cols-4">
          {a.process.items.map((s, i) => (
            <li
              key={s.title}
              data-stagger-item
              className="glass relative flex flex-col justify-between rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl font-bold text-marigold">0{i + 1}</span>
                  {i < a.process.items.length - 1 && (
                    <span className="hidden text-dusk/25 md:inline" aria-hidden="true">→</span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-dusk/75">{s.text}</p>
              </div>
              <div className="mt-6 h-1 w-12 rounded-full bg-field/40" />
            </li>
          ))}
        </ol>
      </section>

      <Cta c={a.cta} />
    </>
  );
}
