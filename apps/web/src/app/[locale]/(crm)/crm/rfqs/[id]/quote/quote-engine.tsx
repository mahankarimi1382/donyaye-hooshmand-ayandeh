'use client';

import { useMemo, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import {
  Button,
  FormField,
  Input,
  LedgerTable,
  Notice,
  SectionHeader,
  Select,
  Textarea,
} from '@karvan/ui';
import {
  Money,
  calculateLineTotal,
  calculateQuoteSubtotal,
  calculateQuoteTotal,
  requiresManagementApproval,
} from '@karvan/core';
import { INCOTERMS_2020 } from '@karvan/contracts';
import type { CurrencyCode, Incoterm, RfqLineUnit } from '@karvan/contracts';
import { formatMoney, toFarsiDigits } from '@karvan/i18n';
import type { Dictionary } from '@karvan/i18n';

import { postJson } from '../../../_components/api-client';
import { MutationErrorNotice } from '../../../_components/mutation-feedback';
import type { LedgerColumnDef } from '@karvan/ui';

/*
 * Quote engine: drafts a proforma against an RFQ. Money never touches
 * IEEE-754 — line totals and the grand total run through @karvan/core Money.
 * Totals rows use dotted leaders with a double-rule grand total; Farsi digits
 * for the money prose, mono Latin digits inside inputs.
 */

interface EngineLine {
  description: string;
  quantity: string;
  unit: RfqLineUnit;
  unitPrice: string;
}

/* Ledger rows carry their own index; column renderers only receive the row. */
type LineRow = EngineLine & {index: number};

export interface QuoteEngineRecord {
  id: string;
  reference: string;
  lines: ReadonlyArray<{description: string; quantity: string; unit: RfqLineUnit}>;
  incoterm: Incoterm;
  incotermNamedPlace?: string;
  destinationCity: string;
}

export interface QuoteEngineLabels {
  lineItems: string;
  addLine: string;
  removeLine: string;
  freight: string;
  insurance: string;
  tax: string;
  discount: string;
  discountHint: string;
  approvalWarning: string;
  approvalBadge: string;
  approvalNeededDisabled: string;
  paymentTerms: string;
  validUntil: string;
  currency: string;
  incoterm: string;
  namedPlace: string;
  namedPlaceHint: string;
  productionDays: string;
  transitDays: string;
  totalDays: string;
  daysUnit: string;
  unitPrice: string;
  lineTotal: string;
  description: string;
  quantity: string;
  unit: string;
  saveDraft: string;
  registerAndSend: string;
  successTitle: string;
  draftSuccessTitle: string;
  checksumLabel: string;
  portalPreview: string;
  anotherQuote: string;
  lineRequired: string;
  paymentTermsRequired: string;
  validUntilRequired: string;
  leadTimeRequired: string;
  snapshotNotice: string;
  totals: {subtotal: string; shipping: string; insurance: string; tax: string; discount: string; grandTotal: string};
  errors: {
    versionConflict: string;
    refresh: string;
    forbidden: string;
    sessionExpired: string;
    invalidTransition: string;
    genericError: string;
  };
}

interface CreatedQuote {
  id: string;
  quoteNumber: string;
  version: number;
  approvalRequired: boolean;
}

interface FinalizedQuote extends CreatedQuote {
  snapshot?: {checksum: string};
}

function moneyOrZero(amount: string, currency: CurrencyCode): Money {
  if (amount.trim().length === 0) return Money.zero(currency);
  try {
    return Money.from(amount, currency);
  } catch {
    return Money.zero(currency);
  }
}

export function QuoteEngine({
  rfq,
  locale,
  dictionary,
}: {
  rfq: QuoteEngineRecord;
  locale: 'fa' | 'en';
  dictionary: Dictionary;
}) {
  const router = useRouter();
  const labels = dictionary.crm.quoteEngine;

  const [lines, setLines] = useState<EngineLine[]>(
    rfq.lines.map((line) => ({
      description: line.description,
      quantity: String(line.quantity),
      unit: line.unit,
      unitPrice: '',
    })),
  );
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [shipping, setShipping] = useState('');
  const [insurance, setInsurance] = useState('');
  const [tax, setTax] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [incoterm, setIncoterm] = useState<Incoterm>(rfq.incoterm);
  const [namedPlace, setNamedPlace] = useState(rfq.incotermNamedPlace ?? '');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [productionDays, setProductionDays] = useState('');
  const [transitDays, setTransitDays] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  });
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<{status: number; code: string; message: string} | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [created, setCreated] = useState<FinalizedQuote | null>(null);

  const defaultValidUntil = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), []);

  const money = useMemo(() => {
    const lineTotals = lines.map((line) => {
      try {
        return calculateLineTotal(
          {unitPrice: line.unitPrice.trim().length > 0 ? line.unitPrice : '0', quantity: line.quantity, discountPct: 0},
          currency,
        );
      } catch {
        return Money.zero(currency);
      }
    });
    const subtotal = calculateQuoteSubtotal(
      lines.map((line, index) => ({
        unitPrice: line.unitPrice.trim().length > 0 ? line.unitPrice : '0',
        quantity: line.quantity,
        discountPct: 0,
      })),
      currency,
    );
    const discount = discountPct > 0 ? subtotal.mul(String(discountPct)).div('100') : Money.zero(currency);
    const total = calculateQuoteTotal({
      lines: lines.map((line, index) => ({
        unitPrice: line.unitPrice.trim().length > 0 ? line.unitPrice : '0',
        quantity: line.quantity,
        discountPct: 0,
      })),
      shipping: moneyOrZero(shipping, currency),
      insurance: moneyOrZero(insurance, currency),
      tax: moneyOrZero(tax, currency),
      discount,
      currency,
    });
    return {lineTotals, subtotal, discount, total};
  }, [lines, currency, shipping, insurance, tax, discountPct]);

  const approvalRequired = requiresManagementApproval(discountPct, Number(money.total.format()));

  const faMoney = (amount: Money): string => formatMoney(amount.format(), currency, locale);

  const updateLine = (index: number, patch: Partial<EngineLine>) => {
    setLines((current) => current.map((line, i) => (i === index ? {...line, ...patch} : line)));
  };

  const addLine = () => {
    setLines((current) => [
      ...current,
      {description: '', quantity: '1', unit: rfq.lines[0]?.unit ?? 'metric_ton', unitPrice: ''},
    ]);
  };

  const submit = async (finalize: boolean) => {
    setValidationError(null);
    setFailure(null);
    if (lines.some((line) => line.description.trim().length === 0 || line.unitPrice.trim().length === 0)) {
      setValidationError(labels.lineRequired);
      return;
    }
    if (lines.some((line) => line.quantity.trim().length === 0 || !(Number(line.quantity) > 0))) {
      setValidationError(labels.lineRequired);
      return;
    }
    if (paymentTerms.trim().length < 2) {
      setValidationError(labels.paymentTermsRequired);
      return;
    }
    if (validUntil.trim().length === 0) {
      setValidationError(labels.validUntilRequired);
      return;
    }
    const production = Number(productionDays);
    const transit = Number(transitDays);
    if (!Number.isInteger(production) || production <= 0 || !Number.isInteger(transit) || transit <= 0) {
      setValidationError(labels.leadTimeRequired);
      return;
    }

    setPending(true);
    const payload = {
      rfqId: rfq.id,
      currency,
      lines: lines.map((line) => ({
        description: line.description.trim(),
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice.trim(),
        lineTotal: calculateLineTotal({unitPrice: line.unitPrice.trim(), quantity: line.quantity, discountPct: 0}, currency).format(),
        discountPercentage: 0,
      })),
      shippingAmount: shipping.trim().length > 0 ? shipping.trim() : '0',
      insuranceAmount: insurance.trim().length > 0 ? insurance.trim() : '0',
      taxAmount: tax.trim().length > 0 ? tax.trim() : '0',
      discountPercentage: discountPct,
      incoterm,
      incotermNamedPlace: namedPlace.trim().length > 0 ? namedPlace.trim() : undefined,
      paymentTerms: paymentTerms.trim(),
      leadTimeDays: production + transit,
      productionDays: production,
      transitDays: transit,
      validUntil,
    };

    const draftResult = await postJson<CreatedQuote>('/api/v1/quotes', payload);
    if (!draftResult.ok) {
      setPending(false);
      setFailure(draftResult.failure);
      return;
    }

    const quote: FinalizedQuote = draftResult.data;
    if (finalize && !quote.approvalRequired) {
      const finalizeResult = await postJson<FinalizedQuote>(`/api/v1/quotes/${quote.id}/finalize`, {
        expectedVersion: quote.version,
      });
      setPending(false);
      if (!finalizeResult.ok) {
        setFailure(finalizeResult.failure);
        return;
      }
      setCreated(finalizeResult.data);
    } else {
      setPending(false);
      setCreated(quote);
    }
    router.refresh();
  };

  const lineRows: LineRow[] = lines.map((line, index) => ({...line, index}));

  const lineColumns: ReadonlyArray<LedgerColumnDef<LineRow>> = [
    {
      key: 'description',
      header: labels.description,
      render: (row) => (
        <Input
          aria-label={`${labels.description} ${toFarsiDigits(row.index + 1)}`}
          value={row.description}
          onChange={(event) => updateLine(row.index, {description: event.target.value})}
          className="min-w-56"
        />
      ),
    },
    {
      key: 'quantity',
      header: labels.quantity,
      numeric: true,
      mono: true,
      render: (row) => (
        <Input
          aria-label={`${labels.quantity} ${toFarsiDigits(row.index + 1)}`}
          inputMode="decimal"
          value={row.quantity}
          onChange={(event) => updateLine(row.index, {quantity: event.target.value})}
          className="w-24 text-end"
        />
      ),
    },
    {
      key: 'unit',
      header: labels.unit,
      render: (row) => <span className="text-ink-soft">{dictionary.units[row.unit]}</span>,
    },
    {
      key: 'unitPrice',
      header: labels.unitPrice,
      numeric: true,
      render: (row) => (
        <Input
          aria-label={`${labels.unitPrice} ${toFarsiDigits(row.index + 1)}`}
          inputMode="decimal"
          placeholder="0.00"
          value={row.unitPrice}
          onChange={(event) => updateLine(row.index, {unitPrice: event.target.value})}
          className="w-28 text-end"
        />
      ),
    },
    {
      key: 'lineTotal',
      header: labels.lineTotal,
      numeric: true,
      mono: true,
      render: (row) => <span className="text-ink">{faMoney(money.lineTotals[row.index])}</span>,
    },
    {
      key: 'remove',
      header: '',
      align: 'end',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={lines.length === 1}
          aria-label={`${labels.removeLine} ${toFarsiDigits(row.index + 1)}`}
          onClick={() => setLines((current) => current.filter((_, i) => i !== row.index))}
        >
          {labels.removeLine}
        </Button>
      ),
    },
  ];

  if (created) {
    return (
      <div className="flex flex-col gap-6">
        <Notice variant={created.snapshot ? 'success' : 'info'} tag={created.quoteNumber}>
          <span className="block">
            <bdi className="font-mono text-lg text-ink">{created.quoteNumber}</bdi>
          </span>
          {created.snapshot ? labels.successTitle : labels.draftSuccessTitle}
        </Notice>
        {created.snapshot && (
          <div className="rounded-[2px] border border-rule bg-well px-4 py-3">
            <p className="font-mono text-[13px] text-ink-soft">{labels.checksumLabel}</p>
            <p className="mt-1 flex items-center gap-2">
              <bdi dir="ltr" className="font-mono text-[13px] break-all text-ink">
                {created.snapshot.checksum}
              </bdi>
            </p>
            <p className="mt-2 text-[13px] text-ink-soft">{labels.snapshotNotice}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {created.snapshot && (
            <Button variant="harbor" onClick={() => router.push(`/portal/quotes/${created.id}`)}>
              {labels.portalPreview}
            </Button>
          )}
          <Button variant="outline" onClick={() => setCreated(null)}>
            {labels.anotherQuote}
          </Button>
        </div>
      </div>
    );
  }

  const totalRows: Array<{label: string; value: string; sign?: string}> = [
    {label: labels.totals.subtotal, value: faMoney(money.subtotal)},
    {label: labels.totals.shipping, value: faMoney(moneyOrZero(shipping, currency))},
    {label: labels.totals.insurance, value: faMoney(moneyOrZero(insurance, currency))},
    {label: labels.totals.tax, value: faMoney(moneyOrZero(tax, currency))},
    {label: labels.totals.discount, value: faMoney(money.discount), sign: '−'},
  ];

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader index={toFarsiDigits('01')} title={labels.lineItems} />
      <div className="-mt-6 overflow-x-auto rounded-[2px] border border-rule shadow-register">
        <LedgerTable
          columns={lineColumns}
          rows={lineRows}
          rowKey={(row) => `line-${row.index}`}
          density="comfortable"
          caption={labels.lineItems}
        />
      </div>
      <div className="-mt-6">
        <Button variant="outline" size="sm" onClick={addLine}>
          {labels.addLine}
        </Button>
      </div>

      <SectionHeader index={toFarsiDigits('02')} title={labels.freight} />
      <div className="-mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label={labels.freight}>
          <Input inputMode="decimal" placeholder="0.00" value={shipping} onChange={(event) => setShipping(event.target.value)} />
        </FormField>
        <FormField label={labels.insurance}>
          <Input inputMode="decimal" placeholder="0.00" value={insurance} onChange={(event) => setInsurance(event.target.value)} />
        </FormField>
        <FormField label={labels.tax}>
          <Input inputMode="decimal" placeholder="0.00" value={tax} onChange={(event) => setTax(event.target.value)} />
        </FormField>
        <FormField label={labels.discount} hint={labels.discountHint} className="md:col-span-2">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={discountPct}
              onChange={(event) => setDiscountPct(Number(event.target.value))}
              aria-label={labels.discount}
              className="h-2 w-full max-w-xs accent-harbor"
            />
            <bdi className="font-mono text-[13px] text-ink" dir="ltr">
              {discountPct.toFixed(1)}%
            </bdi>
          </div>
        </FormField>
      </div>

      <SectionHeader index={toFarsiDigits('03')} title={labels.incoterm} />
      <div className="-mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label={labels.incoterm}>
          <Select value={incoterm} onChange={(event) => setIncoterm(event.target.value as Incoterm)}>
            {INCOTERMS_2020.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={labels.namedPlace} hint={labels.namedPlaceHint}>
          <Input value={namedPlace} onChange={(event) => setNamedPlace(event.target.value)} placeholder={rfq.destinationCity} />
        </FormField>
        <FormField label={labels.currency}>
          <Select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}>
            {Object.entries(dictionary.currencies).map(([code, name]) => (
              <option key={code} value={code}>
                <bdi>{code}</bdi> — {name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <SectionHeader index={toFarsiDigits('04')} title={labels.paymentTerms} />
      <div className="-mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label={labels.paymentTerms}>
          <Textarea rows={3} value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label={labels.productionDays}>
            <Input
              inputMode="numeric"
              value={productionDays}
              onChange={(event) => setProductionDays(event.target.value)}
              placeholder="10"
            />
          </FormField>
          <FormField label={labels.transitDays}>
            <Input
              inputMode="numeric"
              value={transitDays}
              onChange={(event) => setTransitDays(event.target.value)}
              placeholder="20"
            />
          </FormField>
          <p className="text-sm text-ink-soft sm:col-span-2">
            {labels.totalDays}:{' '}
            <bdi className="font-mono text-[13px] text-ink">
              {Number.isInteger(Number(productionDays)) && Number.isInteger(Number(transitDays))
                ? Number(productionDays) + Number(transitDays)
                : '—'}
            </bdi>{' '}
            {labels.daysUnit}
          </p>
        </div>
        <FormField label={labels.validUntil}>
          <Input type="date" value={validUntil} min={defaultValidUntil} onChange={(event) => setValidUntil(event.target.value)} />
        </FormField>
      </div>

      <SectionHeader index={toFarsiDigits('05')} title={labels.totals.grandTotal} />
      <div className="-mt-6 rounded-[2px] border border-rule bg-sheet p-5 shadow-register">
        <dl className="mx-auto max-w-md">
          {totalRows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-2 py-1 text-sm" aria-label={row.label}>
              <dt className="text-ink-soft">{row.label}</dt>
              <span aria-hidden="true" className="min-w-8 flex-1 border-b border-dotted border-rule-strong" />
              <dd className="font-mono text-[13px] text-ink">
                {row.sign === '−' ? '−' : ''}{' '}
                <bdi>{row.value}</bdi>
              </dd>
            </div>
          ))}
          <div className="mt-3 flex items-baseline gap-2 border-t-[3px] border-double border-ink pt-3" aria-label={labels.totals.grandTotal}>
            <dt className="text-base font-medium text-ink">{labels.totals.grandTotal}</dt>
            <span aria-hidden="true" className="min-w-8 flex-1" />
            <dd className="font-display text-2xl text-ink">
              <bdi>{faMoney(money.total)}</bdi>
            </dd>
          </div>
        </dl>
        {approvalRequired && (
          <div className="mt-4">
            <Notice variant="warning" tag={labels.approvalBadge}>
              {labels.approvalWarning}
            </Notice>
          </div>
        )}
      </div>

      {validationError && (
        <Notice variant="danger" tag="VALIDATION">
          {validationError}
        </Notice>
      )}
      {failure && (
        <MutationErrorNotice
          failure={failure}
          labels={{
            versionConflict: labels.errors.versionConflict,
            forbidden: labels.errors.forbidden,
            sessionExpired: labels.errors.sessionExpired,
            invalidTransition: labels.errors.invalidTransition,
            genericError: labels.errors.genericError,
            refresh: labels.errors.refresh,
          }}
          onRefresh={() => router.refresh()}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ink" isLoading={pending} onClick={() => void submit(false)}>
          {labels.saveDraft}
        </Button>
        <Button
          variant="harbor"
          isLoading={pending}
          disabled={approvalRequired}
          title={approvalRequired ? labels.approvalNeededDisabled : undefined}
          onClick={() => void submit(true)}
        >
          {labels.registerAndSend}
        </Button>
        {approvalRequired && <p className="max-w-md text-[13px] text-ink-soft">{labels.approvalNeededDisabled}</p>}
      </div>
    </div>
  );
}
