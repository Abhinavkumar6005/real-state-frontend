import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Motion from '@/components/Motion';
import CustomCursor from '@/components/CustomCursor';
import { getContent } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const c = await getContent();
  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Cohesive ambient gradient + subtle architectural grid visible through translucent layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="ambient-grid absolute inset-0" />
        <div className="absolute -left-32 top-[18%] h-[520px] w-[520px] rounded-full bg-field/10 blur-[120px]" />
        <div className="absolute -right-24 top-[48%] h-[480px] w-[480px] rounded-full bg-marigold/15 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[25%] h-[420px] w-[420px] rounded-full bg-dusk/10 blur-[120px]" />
      </div>

      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-marigold focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header name={c.brand.name} logo={c.brand.logo} />
      <main id="main">{children}</main>
      <Footer c={c} />
      <Motion />
      <CustomCursor />
    </div>
  );
}
