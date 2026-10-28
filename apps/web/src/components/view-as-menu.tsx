import { UserRound } from 'lucide-react';

import { switchView } from '@/app/actions/session';
import type { Dictionary } from '@karvan/i18n';

import { DEMO_IDENTITIES, DEMO_IDENTITY_LABEL_KEYS, type SessionArea } from '@/lib/session';

interface ViewAsMenuProps {
  dictionary: Dictionary;
  locale: string;
  area: SessionArea;
  currentKey: string | null;
  currentName: string;
}

export function ViewAsMenu({ dictionary, locale, area, currentKey, currentName }: ViewAsMenuProps) {
  const identities = DEMO_IDENTITIES.filter((identity) => identity.area === area && identity.key !== currentKey);
  const switchViewForArea = switchView.bind(null, area);

  return (
    <details className="relative">
      <summary className="inline-flex h-8 cursor-pointer list-none items-center gap-2 rounded-[2px] border border-rule bg-sheet px-2.5 font-mono text-xs text-ink-soft shadow-register hover:bg-well hover:text-ink [&::-webkit-details-marker]:hidden">
        <UserRound size={14} aria-hidden />
        <span className="max-w-36 truncate">{currentName}</span>
        <span className="text-ink-faint">{dictionary.crm.viewAs}</span>
      </summary>
      <div className="absolute end-0 z-40 mt-2 w-64 rounded-[2px] border border-rule bg-sheet shadow-register-lg">
        <p className="border-b border-rule px-3 py-2 text-xs text-ink-soft">{dictionary.session.pickIdentity}</p>
        <ul className="py-1">
          {identities.map((identity) => (
            <li key={identity.key} className="px-1.5 py-0.5">
              <form action={switchViewForArea} className="flex items-center justify-between gap-2 px-1.5 py-1">
                <input type="hidden" name="key" value={identity.key} />
                <input type="hidden" name="locale" value={locale} />
                <span className="text-sm text-ink">
                  {dictionary.session.labels[DEMO_IDENTITY_LABEL_KEYS[identity.key]]}
                </span>
                <button
                  type="submit"
                  className="rounded-[2px] border border-rule bg-well px-2 py-1 font-mono text-xs text-ink hover:border-rule-strong"
                >
                  {dictionary.session.switch}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
