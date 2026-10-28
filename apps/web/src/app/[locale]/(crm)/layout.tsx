import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

interface CrmLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CrmLayout({ children, params }: CrmLayoutProps) {
  // Non-showcase route: disabled for pure corporate presentation site
  notFound();
}
