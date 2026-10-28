import { Bell } from 'lucide-react';

import { markAllNotificationsRead } from '@/app/actions/notifications';
import { formatDateTime, type Dictionary } from '@karvan/i18n';

import type { NotificationRecord } from '@/lib/types';
import type { SessionArea } from '@/lib/session';

interface NotificationsBellProps {
  dictionary: Dictionary;
  locale: string;
  area: SessionArea;
  records: readonly NotificationRecord[];
  unreadCount: number;
}

function notificationMessage(dictionary: Dictionary, record: NotificationRecord): string {
  return dictionary.notifications[record.template].replace(/\{(\w+)\}/g, (match, key: string) =>
    record.params[key] ?? match,
  );
}

export function NotificationsBell({ dictionary, locale, area, records, unreadCount }: NotificationsBellProps) {
  const labels = dictionary.portal.notifications;
  const visible = records.slice(0, 8);
  const markAllRead = markAllNotificationsRead.bind(null, area);

  return (
    <details className="relative">
      <summary className="relative inline-flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-[2px] border border-rule bg-sheet text-ink-soft shadow-register hover:bg-well hover:text-ink [&::-webkit-details-marker]:hidden">
        <Bell size={15} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-[2px] bg-stamp px-1 font-mono text-[10px] leading-none text-sheet">
            {unreadCount}
          </span>
        ) : null}
        <span className="sr-only">{labels.unread}</span>
      </summary>
      <div className="absolute end-0 z-40 mt-2 w-80 rounded-[2px] border border-rule bg-sheet shadow-register-lg">
        <div className="flex items-center justify-between border-b border-rule px-3 py-2">
          <span className="font-mono text-xs text-ink-faint">{labels.unread}</span>
          <form action={markAllRead}>
            <button
              type="submit"
              className="font-mono text-xs text-harbor underline-offset-4 hover:underline"
            >
              {labels.markAllRead}
            </button>
          </form>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {visible.length === 0 ? (
            <li className="px-3 py-4 text-sm text-ink-soft">{labels.empty}</li>
          ) : (
            visible.map((record) => (
              <li
                key={record.id}
                className={`border-b border-rule px-3 py-2.5 last:border-b-0 ${record.read ? '' : 'bg-well'}`}
              >
                <p className="text-sm leading-6 text-ink">{notificationMessage(dictionary, record)}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-faint" dir="ltr">
                  <bdi>{formatDateTime(record.createdAt, locale === 'en' ? 'en' : 'fa')}</bdi>
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </details>
  );
}
