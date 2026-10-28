import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

interface PortalLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  // Non-showcase route: disabled for pure corporate presentation site
  notFound();
}
