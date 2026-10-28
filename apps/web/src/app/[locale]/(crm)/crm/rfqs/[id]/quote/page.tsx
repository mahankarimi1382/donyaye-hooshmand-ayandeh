import { notFound } from 'next/navigation';

import { getDictionary } from '@karvan/i18n';
import { EmptyState, PageHeader, StampBadge, RFQ_STATUS_META } from '@karvan/ui';
import type { RfqStatus } from '@karvan/core';

import { Link as LocaleLink } from '@/i18n/navigation';
import { actorFromSession, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { RfqRecord } from '@/lib/types';

import { QuoteEngine } from './quote-engine';

interface QuoteEnginePageProps {
  params: Promise<{locale: string; id: string}>;
}

const PRICABLE_STATUSES: ReadonlySet<RfqStatus> = new Set(['qualified', 'quote_preparation', 'quoted']);

export default async function QuoteEnginePage({params}: QuoteEnginePageProps) {
  const {locale, id} = await params;
  const dictionary = getDictionary(locale);
  const labels = dictionary.crm;

  const session = await getEffectiveSession('crm');
  const actor = actorFromSession(session);
  const store = getStore();

  let rfq: RfqRecord;
  try {
    rfq = store.getRfq(actor, id);
  } catch {
    notFound();
  }

  const buyer = store.getOrganization(rfq.buyerOrganizationId);

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={labels.quoteEngine.title}
        meta={[
          {label: labels.tableHeaders.reference, value: rfq.reference},
          {label: labels.rfqDetail.metaVersion, value: `v${rfq.version}`},
          {label: labels.tableHeaders.buyer, value: buyer.name[locale === 'en' ? 'en' : 'fa']},
        ]}
        actions={
          <LocaleLink
            href={`/crm/rfqs/${rfq.id}`}
            className="inline-flex h-8 items-center rounded-[2px] border border-rule-strong px-3 text-sm text-ink transition-colors hover:border-harbor hover:text-harbor"
          >
            {dictionary.common.actions.back}
          </LocaleLink>
        }
      />

      {PRICABLE_STATUSES.has(rfq.status) ? (
        <QuoteEngine
          locale={locale === 'en' ? 'en' : 'fa'}
          dictionary={dictionary}
          rfq={{
            id: rfq.id,
            reference: rfq.reference,
            lines: rfq.lines.map((line) => ({
              description: line.description,
              quantity: String(line.quantity),
              unit: line.unit,
            })),
            incoterm: rfq.incoterm,
            incotermNamedPlace: rfq.incotermNamedPlace,
            destinationCity: rfq.destinationCity,
          }}
        />
      ) : (
        <EmptyState
          title={labels.quoteEngine.notPricableTitle}
          code={`RFQ/${rfq.status.toUpperCase()}`}
          description={labels.quoteEngine.notPricableDescription}
        />
      )}

      {!PRICABLE_STATUSES.has(rfq.status) && (
        <div className="flex items-center gap-3">
          <StampBadge status={rfq.status} label={dictionary.statuses.rfq[rfq.status].label} meta={RFQ_STATUS_META[rfq.status]} />
        </div>
      )}
    </section>
  );
}
