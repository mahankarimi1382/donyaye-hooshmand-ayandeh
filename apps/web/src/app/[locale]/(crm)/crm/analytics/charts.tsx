'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Tabs } from '@karvan/ui';
import { SectionHeader } from '@karvan/ui';
import { toFarsiDigits } from '@karvan/i18n';

/*
 * Executive analytics charts (recharts 3). Charts render LTR per DESIGN_SPEC
 * §7 — wrapped in dir="ltr", Persian tick labels via Farsi digits, page
 * chrome mirrored by the document. Colors come exclusively from chart tokens
 * via CSS var() strings so dark mode follows the theme.
 */

export interface AnalyticsDataset {
  statuses: ReadonlyArray<{status: string; label: string; count: number; color: string}>;
  monthly: ReadonlyArray<{month: string; label: string; value: number}>;
  funnel: ReadonlyArray<{stage: string; label: string; count: number}>;
}

export interface AnalyticsLabels {
  rangeTabs: ReadonlyArray<{id: string; label: string}>;
  statusTitle: string;
  monthlyTitle: string;
  funnelTitle: string;
  countAxis: string;
  valueAxis: string;
  sectionIndexes: {status: string; monthly: string; funnel: string};
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-sheet)',
  border: '1px solid var(--color-rule-strong)',
  borderRadius: 2,
  fontSize: 13,
  fontFamily: 'var(--font-mono)',
  color: 'var(--color-ink)',
} as const;

export function AnalyticsCharts({
  datasets,
  labels,
}: {
  datasets: Readonly<Record<string, AnalyticsDataset>>;
  labels: AnalyticsLabels;
}) {
  const [range, setRange] = useState(labels.rangeTabs[0]?.id ?? '30');
  const data = datasets[range] ?? datasets[labels.rangeTabs[0]!.id]!;

  const monthly = useMemo(
    () => data.monthly.map((entry) => ({...entry, labelFa: toFarsiDigits(entry.label)})),
    [data],
  );
  const funnel = useMemo(() => [...data.funnel].reverse(), [data]);

  return (
    <div className="flex flex-col gap-10">
      <Tabs
        value={range}
        items={labels.rangeTabs.map((tab) => ({id: tab.id, label: tab.label, content: null}))}
        onValueChange={setRange}
      />

      <section className="flex flex-col gap-4">
        <SectionHeader index={labels.sectionIndexes.status} title={labels.statusTitle} />
        <div dir="ltr" className="h-72 rounded-[2px] border border-rule bg-sheet p-4 shadow-register">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.statuses} margin={{top: 8, right: 8, bottom: 24, left: 8}}>
              <CartesianGrid stroke="var(--color-rule)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{fill: 'var(--color-ink-soft)', fontSize: 11, fontFamily: 'var(--font-mono)'}}
                tickLine={false}
                axisLine={{stroke: 'var(--color-rule-strong)'}}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={56}
              />
              <YAxis
                allowDecimals={false}
                width={40}
                tick={{fill: 'var(--color-ink-soft)', fontSize: 12, fontFamily: 'var(--font-mono)'}}
                tickFormatter={(value: number) => toFarsiDigits(value)}
                tickLine={false}
                axisLine={false}
                label={{value: labels.countAxis, position: 'insideTopLeft', fill: 'var(--color-ink-faint)', fontSize: 12}}
              />
              <Tooltip cursor={{fill: 'var(--color-row-hover)'}} contentStyle={TOOLTIP_STYLE} formatter={(value) => toFarsiDigits(Number(value))} />
              <Bar dataKey="count" radius={[1, 1, 0, 0]} maxBarSize={40}>
                {data.statuses.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-soft">
          {data.statuses.map((entry) => (
            <span key={entry.status} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block size-2 rounded-[1px]" style={{backgroundColor: entry.color}} />
              {entry.label}
            </span>
          ))}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader index={labels.sectionIndexes.monthly} title={labels.monthlyTitle} />
        <div dir="ltr" className="h-72 rounded-[2px] border border-rule bg-sheet p-4 shadow-register">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{top: 8, right: 8, bottom: 8, left: 8}}>
              <CartesianGrid stroke="var(--color-rule)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="labelFa"
                tick={{fill: 'var(--color-ink-soft)', fontSize: 12}}
                tickLine={false}
                axisLine={{stroke: 'var(--color-rule-strong)'}}
              />
              <YAxis
                width={56}
                tick={{fill: 'var(--color-ink-soft)', fontSize: 12, fontFamily: 'var(--font-mono)'}}
                tickFormatter={(value: number) => toFarsiDigits(value.toLocaleString('en-US'))}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{stroke: 'var(--color-rule-strong)'}}
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => toFarsiDigits(Number(value).toLocaleString('en-US'))}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="var(--color-chart-1)"
                fillOpacity={0.08}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader index={labels.sectionIndexes.funnel} title={labels.funnelTitle} />
        <div dir="ltr" className="h-64 rounded-[2px] border border-rule bg-sheet p-4 shadow-register">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{top: 8, right: 24, bottom: 8, left: 8}}>
              <CartesianGrid stroke="var(--color-rule)" strokeDasharray="2 4" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{fill: 'var(--color-ink-soft)', fontSize: 12, fontFamily: 'var(--font-mono)'}}
                tickFormatter={(value: number) => toFarsiDigits(value)}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={96}
                tick={{fill: 'var(--color-ink)', fontSize: 13}}
                tickLine={false}
                axisLine={{stroke: 'var(--color-rule-strong)'}}
              />
              <Tooltip cursor={{fill: 'var(--color-row-hover)'}} contentStyle={TOOLTIP_STYLE} formatter={(value) => toFarsiDigits(Number(value))} />
              <Bar dataKey="count" fill="var(--color-chart-2)" radius={[0, 1, 1, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
