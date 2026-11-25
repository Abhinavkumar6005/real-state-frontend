import Link from 'next/link';
import Image from 'next/image';
import { mediaUrl } from '@/lib/api';

const tone = { Available: 'bg-field text-white', Booked: 'bg-marigold text-dusk', Sold: 'bg-dusk/80 text-white' };

export default function PlotCard({ p }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-fog">
        {p.images?.[0] && <Image src={mediaUrl(p.images[0])} alt={`${p.title}, ${p.location}`} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${tone[p.availability]}`}>{p.availability}</span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl font-semibold">{p.title}</h3>
        <p className="mt-1 text-dusk/60">{[p.location, p.area].filter(Boolean).join(', ')}</p>
        {p.description && <p className="mt-3 line-clamp-3 text-dusk/80">{p.description}</p>}
        <div className="mt-5 flex items-center justify-between">
          <span className="font-semibold">{p.price}</span>
          {p.availability === 'Available' && <Link href={`/book-a-visit?plot=${p._id}`} className="text-sm font-semibold underline decoration-marigold decoration-2 underline-offset-4 hover:text-field">Book this plot</Link>}
        </div>
      </div>
    </article>
  );
}
