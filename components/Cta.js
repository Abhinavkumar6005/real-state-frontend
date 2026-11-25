import Link from 'next/link';

export default function Cta({ c }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-marigold via-marigold to-[#e5a322]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-10">
        <h2 data-reveal-3d className="display max-w-4xl text-5xl text-dusk md:text-7xl">{c.headline}</h2>
        <p data-reveal className="mt-6 max-w-xl text-lg text-dusk/85">{c.text}</p>
        <Link data-reveal data-cursor="Book" href="/book-a-visit" className="btn btn-dark mt-10">
          {c.button}
        </Link>
      </div>
    </section>
  );
}
