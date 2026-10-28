'use client';

import { Link, usePathname } from '@/i18n/navigation';

export interface ShellTab {
  href: string;
  label: string;
}

interface ShellTabsProps {
  tabs: readonly ShellTab[];
  label: string;
}

export function ShellTabs({ tabs, label }: ShellTabsProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex items-stretch gap-1 self-stretch">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center border-b-2 px-3 font-mono text-sm transition-colors ${
              active
                ? 'border-stamp text-ink'
                : 'border-transparent text-ink-soft hover:border-rule-strong hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
