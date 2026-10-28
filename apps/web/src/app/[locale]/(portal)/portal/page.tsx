import { getDictionary } from '@karvan/i18n';

interface PortalDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PortalDashboardPage({ params }: PortalDashboardPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return (
    <section>
      <header className="border-b border-rule pb-4">
        <h1 className="font-display text-3xl text-ink">{dictionary.portal.title}</h1>
        <p className="mt-2 text-ink-soft">{dictionary.portal.welcome}</p>
        <p className="mt-3 font-mono text-xs text-ink-faint">{dictionary.portal.tabs.dashboard}</p>
      </header>
    </section>
  );
}
