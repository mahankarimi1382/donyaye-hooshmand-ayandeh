import { getDictionary, type Dictionary } from '@karvan/i18n';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { actorFromSession, DEMO_IDENTITIES, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';

import { NotificationsBell } from '@/components/notifications-bell';
import { ShellTabs, type ShellTab } from '@/components/shell-tabs';
import { ViewAsMenu } from '@/components/view-as-menu';

interface CrmShellProps {
  locale: string;
  children: ReactNode;
}

export async function CrmShell({ locale, children }: CrmShellProps) {
  const dictionary: Dictionary = getDictionary(locale);
  const session = await getEffectiveSession('crm');
  const store = getStore();
  const { items, unreadCount } = store.listNotifications(actorFromSession(session));
  const currentKey = DEMO_IDENTITIES.find((identity) => identity.userId === session.userId)?.key ?? null;

  const tabs: readonly ShellTab[] = [
    { href: '/crm', label: dictionary.crm.tabs.inbox },
    { href: '/crm/cases', label: dictionary.crm.tabs.cases },
    { href: '/crm/analytics', label: dictionary.crm.tabs.analytics },
    { href: '/crm/audit', label: dictionary.crm.tabs.audit },
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
            <ShellTabs tabs={tabs} label={dictionary.crm.title} />
          </div>
          <div className="flex items-center gap-2">
            <ViewAsMenu
              dictionary={dictionary}
              locale={locale}
              area="crm"
              currentKey={currentKey}
              currentName={session.name}
            />
            <NotificationsBell
              dictionary={dictionary}
              locale={locale}
              area="crm"
              records={items}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
