'use client';
import dynamic from 'next/dynamic';

const Layout3DScroll = dynamic(() => import('./Layout3DScroll'), {
  ssr: false,
  loading: () => <section className="h-[100svh] bg-[#071929]" aria-hidden="true" />,
});

export default function Layout3DScrollLazy(props) {
  return <Layout3DScroll {...props} />;
}
