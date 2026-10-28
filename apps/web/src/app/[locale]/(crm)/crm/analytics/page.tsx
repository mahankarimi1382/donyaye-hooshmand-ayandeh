import { getDictionary, toFarsiDigits } from '@karvan/i18n';
import { KpiTile, PageHeader } from '@karvan/ui';
import { RFQ_STATUS_META, statusMeta } from '@karvan/ui';
import { Money } from '@karvan/core';
import type { StatusTone } from '@karvan/ui';
import type { RfqStatus } from '@karvan/core';

import { actorFromSession, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';

import { AnalyticsCharts } from './charts';
import type { AnalyticsDataset } from './charts';

interface AnalyticsPageProps {
  params: Promise<{locale: string}>;
}

const RANGE_DAYS = [30, 90, 180] as const;

/* Tone → chart token mapping (DESIGN_SPEC §2: analytics uses --color-chart-1..4). */
const TONE_COLOR: Record<StatusTone, string> = {
  harbor: 'var(--color-chart-1)',
  ochre: 'var(--color-chart-2)',
  clear: 'var(--color-chart-3)',
  observed: 'var(--color-chart-4)',
  'ink-faint': 'var(--color-rule-strong)',
  seal: 'var(--color-stamp)',
};

const MONTH_FORMAT = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {month: 'short'});

export default async function AnalyticsPage({params}: AnalyticsPageProps) {
  const {locale} = await params;
  const dictionary = getDictionary(locale);
  const labels = dictionary.crm.analytics;
  const fa = locale !== 'en';

  const session = await getEffectiveSession('crm');
  const actor = actorFromSession(session);
  const store = getStore();

  const rfqs = store.listRfqs(actor, {pageSize: 100}).items;
  const quotes = store.listQuotes(actor);
  const cases = store.listTradeCases(actor);
  const auditEvents = store.getAuditEvents(actor);

  // KPI: RFQs registered in the current calendar month.
  const now = new Date();
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const rfqsThisMonth = rfqs.filter((rfq) => new Date(rfq.createdAt).getTime() >= monthStart).length;

  // KPI: conversion — accepted RFQs against all visible RFQs.
  const accepted = rfqs.filter((rfq) => rfq.status === 'accepted').length;
  const conversionRate = rfqs.length > 0 ? (accepted / rfqs.length) * 100 : 0;

  // KPI: average response time — registration to the first assignment or
  // qualification audit event for each RFQ.
  const responseHours: number[] = [];
  for (const rfq of rfqs) {
    const firstResponse = auditEvents
      .filter((event) => event.resource.id === rfq.id && (event.type === 'rfq.assigned' || event.type === 'rfq.qualified'))
      .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))[0];
    if (firstResponse) {
      responseHours.push((new Date(firstResponse.occurredAt).getTime() - new Date(rfq.createdAt).getTime()) / 3600000);
    }
  }
  const avgResponseHours =
    responseHours.length > 0 ? responseHours.reduce((total, value) => total + value, 0) / responseHours.length : 0;

  // KPI: case revenue — sum of accepted proforma totals, per currency.
  const acceptedQuotes = quotes.filter((quote) => quote.status === 'accepted');
  const revenueByCurrency = new Map<string, number>();
  for (const quote of acceptedQuotes) {
    const current = revenueByCurrency.get(quote.currency) ?? 0;
    revenueByCurrency.set(quote.currency, current + Number(quote.total));
  }
  const revenueText =
    revenueByCurrency.size === 0
      ? toFarsiDigits(0)
      : [...revenueByCurrency.entries()]
          .map(([currency, amount]) => toFarsiDigits(Math.round(amount).toLocaleString('en-US')))
          .join(' · ');

  const datasets: Record<string, AnalyticsDataset> = {};
  for (const days of RANGE_DAYS) {
    const windowStart = Date.now() - days * 24 * 3600 * 1000;
    const inWindow = rfqs.filter((rfq) => new Date(rfq.createdAt).getTime() >= windowStart);
    const quotesInWindow = quotes.filter((quote) => new Date(quote.createdAt).getTime() >= windowStart);

    const statuses = (Object.keys(dictionary.statuses.rfq) as RfqStatus[]).map((status) => ({
      status,
      label: dictionary.statuses.rfq[status].label,
      count: inWindow.filter((rfq) => rfq.status === status).length,
      color: TONE_COLOR[statusMeta(RFQ_STATUS_META, status).tone],
    }));

    // Proforma value by month from the seeded records inside the window,
    // computed with Money per currency; the chart plots the USD series.
    const monthKeys: string[] = [];
    for (const quote of quotesInWindow) {
      const key = quote.createdAt.slice(0, 7);
      if (!monthKeys.includes(key)) monthKeys.push(key);
    }
    monthKeys.sort();
    const monthly = monthKeys.map((key) => {
      const total = quotesInWindow
        .filter((quote) => quote.currency === 'USD' && quote.createdAt.slice(0, 7) === key)
        .reduce((sum, quote) => sum.add(Money.from(quote.total, quote.currency)), Money.zero('USD'));
      return {
        month: key,
        label: `${MONTH_FORMAT.format(new Date(`${key}-01T00:00:00Z`))} ${key.slice(0, 4)}`,
        value: Number(total.format()),
      };
    });

    const reached = (statuses: readonly RfqStatus[]): number =>
      inWindow.filter((rfq) => statuses.includes(rfq.status)).length;
    const funnel = [
      {stage: 'submitted', label: labels.funnelStages.submitted, count: reached(['submitted', 'under_review', 'needs_information', 'qualified', 'quote_preparation', 'quoted', 'accepted'])},
      {stage: 'qualified', label: labels.funnelStages.qualified, count: reached(['qualified', 'quote_preparation', 'quoted', 'accepted'])},
      {stage: 'quoted', label: labels.funnelStages.quoted, count: reached(['quoted', 'accepted'])},
      {stage: 'accepted', label: labels.funnelStages.accepted, count: reached(['accepted'])},
    ];

    datasets[String(days)] = {statuses, monthly, funnel};
  }

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={dictionary.crm.tabs.analytics}
        meta={[
          {label: labels.kpiTitles.rfqsThisMonth, value: toFarsiDigits(rfqsThisMonth)},
          {label: labels.kpiTitles.caseRevenue, value: revenueText},
        ]}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label={labels.kpiTitles.rfqsThisMonth}
          value={toFarsiDigits(rfqsThisMonth)}
          hint={labels.kpiHints.rfqsThisMonth}
        />
        <KpiTile
          label={labels.kpiTitles.conversionRate}
          value={`${toFarsiDigits(conversionRate.toFixed(1))}٪`}
          hint={labels.kpiHints.conversionRate}
        />
        <KpiTile
          label={labels.kpiTitles.averageResponse}
          value={`${toFarsiDigits(avgResponseHours.toFixed(1))} ${labels.hoursUnit}`}
          hint={labels.kpiHints.averageResponse}
        />
        <KpiTile
          label={labels.kpiTitles.caseRevenue}
          value={revenueText}
          hint={labels.kpiHints.caseRevenue}
        />
      </div>

      <AnalyticsCharts
        datasets={datasets}
        labels={{
          rangeTabs: [
            {id: '30', label: labels.range.d30},
            {id: '90', label: labels.range.d90},
            {id: '180', label: labels.range.d180},
          ],
          statusTitle: labels.chartTitles.statusCounts,
          monthlyTitle: labels.chartTitles.quoteValueByMonth,
          funnelTitle: labels.chartTitles.funnel,
          countAxis: labels.countAxis,
          valueAxis: labels.valueAxis,
          sectionIndexes: {status: '۰۱', monthly: '۰۲', funnel: '۰۳'},
        }}
      />
    </section>
  );
}
