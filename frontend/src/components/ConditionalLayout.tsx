'use client';

import { usePathname } from 'next/navigation';
import Layout from './Layout';
import NoSSR from './NoSSR';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

function ConditionalLayoutContent({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // For admin pages, don't wrap with the main site layout
  if (isAdminPage) {
    return <>{children}</>;
  }

  // For all other pages, use the main site layout
  return <Layout>{children}</Layout>;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <NoSSR fallback={<div style={{ minHeight: '100vh' }}>{children}</div>}>
      <ConditionalLayoutContent>{children}</ConditionalLayoutContent>
    </NoSSR>
  );
}
