import { getDictionary, type Dictionary } from '@karvan/i18n';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { actorFromSession, getEffectiveSession, type SessionPayload } from '@/lib/session';
import { getStore } from '@/lib/store';
import { normalizeTheme, THEME_COOKIE_NAME, type ThemeName } from '@/lib/theme';
import { cookies } from 'next/headers';

import { NotificationsBell } from '@/components/notifications-bell';
import { ShellTabs, type ShellTab } from '@/components/shell-tabs';
import { ThemeToggle } from '@/components/theme-toggle';

interface PortalShellProps {
  locale: string;
  children: ReactNode;
}

async function tenantName(store: ReturnType<typeof getStore>, session: SessionPayload, locale: string): Promise<string> {
  try {
    const organization = store.getOrganization(session.organizationId);
    return locale === 'en' ? organization.name.en : organization.name.fa;
  } catch {
    return session.name;
  }
}

export async function PortalShell({ locale, children }: PortalShellProps) {
  const dictionary: Dictionary = getDictionary(locale);
  const session = await getEffectiveSession('portal');
  const store = getStore();
  const { items, unreadCount } = store.listNotifications(actorFromSession(session));
  const theme: ThemeName = normalizeTheme((await cookies()).get(THEME_COOKIE_NAME)?.value);
  const tenant = await tenantName(store, session, locale);

  const tabs: readonly ShellTab[] = [
    { href: '/portal', label: dictionary.portal.tabs.dashboard },
    { href: '/portal/rfqs', label: dictionary.portal.tabs.rfqs },
    { href: '/portal/orders', label: dictionary.portal.tabs.orders },
    { href: '/portal/documents', label: dictionary.portal.tabs.documents },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-rule bg-sheet">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6 self-stretch">
            <Link href="/" className="font-display text-xl leading-none text-ink">
              {dictionary.common.brandName}
            </Link>
            <span className="h-5 w-px bg-rule" aria-hidden />
            <ShellTabs tabs={tabs} label={dictionary.portal.title} />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-xs text-ink-soft sm:inline">{tenant}</span>
            <span className="h-5 w-px bg-rule" aria-hidden />
            <NotificationsBell
              dictionary={dictionary}
              locale={locale}
              area="portal"
              records={items}
              unreadCount={unreadCount}
            />
            <ThemeToggle theme={theme} label={dictionary.common.meta.themeToggle} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
