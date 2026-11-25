'use client';
import dynamic from 'next/dynamic';

const Layout3D = dynamic(() => import('./Layout3D'), {
  ssr: false,
  loading: () => <section id="layout-3d" className="h-[680px] bg-dusk" aria-hidden="true" />,
});

export default function Layout3DLazy(props) {
  return <Layout3D {...props} />;
}
