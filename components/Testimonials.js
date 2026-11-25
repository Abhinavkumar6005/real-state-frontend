export default function Testimonials({ s }) {
  if (!s?.items?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
      <div className="max-w-3xl">
        <p data-reveal className="mb-4 text-sm font-semibold uppercase tracking-wider text-field">{s.label}</p>
        <h2 data-reveal className="display text-4xl md:text-6xl">{s.headline}</h2>
        {s.text && <p data-reveal className="mt-6 text-lg text-dusk/75">{s.text}</p>}
      </div>

      <div data-stagger className="mt-14 grid gap-6 md:grid-cols-3">
        {s.items.map((t, i) => (
          <figure
            key={t.name + i}
            data-stagger-item
            className="glass flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl leading-none text-marigold" aria-hidden="true">“</span>
                {t.plotTag && <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-field shadow-sm">{t.plotTag}</span>}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-dusk/85">
                {t.quote}
              </blockquote>
            </div>
            <figcaption className="mt-8 border-t border-dusk/10 pt-4">
              <p className="font-display text-lg font-semibold text-dusk">{t.name}</p>
              {t.role && <p className="text-sm text-dusk/60">{t.role}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
