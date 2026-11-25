export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return ['', '/about', '/book-a-visit'].map((p) => ({ url: base + p, lastModified: new Date() }));
}
