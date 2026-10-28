import { multiplyScaledDecimals, parseScaledDecimal, pow10, roundScaledDecimal } from './decimal';
import type { ScaledDecimal } from './decimal';
import { canonicalJsonStringify, sha256 } from './hashing';
import { currencyDecimals, Money } from './money';

export { canonicalJsonStringify, sha256 } from './hashing';

export interface QuoteLineInput {
  unitPrice: string | number;
  quantity: string | number;
  discountPct?: number;
}

export interface ApprovalThresholds {
  discountPct?: number;
  total?: number;
}

export interface QuoteParty {
  organizationId: string;
  name: string;
  country?: string;
  city?: string;
  taxNumber?: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

export interface QuoteSnapshotLineItem {
  id: string;
  productId?: string;
  description: string;
  hsCode?: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  discountPct: number;
  lineTotal: string;
}

export interface QuoteSnapshotFinancials {
  currency: string;
  subtotal: string;
  shipping: string;
  insurance: string;
  tax: string;
  discount: string;
  total: string;
}

export interface QuoteSnapshotIncoterms {
  code: string;
  location: string;
}

export interface QuoteSnapshotLeadTime {
  productionDays?: number;
  transitDays?: number;
  totalDays?: number;
  note?: string;
}

export interface QuoteSnapshotInput {
  quoteId: string;
  quoteNumber: string;
  rfqId: string;
  rfqReference?: string;
  version: number;
  seller: QuoteParty;
  buyer: QuoteParty;
  lines: readonly QuoteSnapshotLineItem[];
  financials: QuoteSnapshotFinancials;
  incoterms: QuoteSnapshotIncoterms;
  leadTime: QuoteSnapshotLeadTime;
  validUntil: string;
  notes?: string;
}

export interface QuoteSnapshot extends QuoteSnapshotInput {
  readonly snapshotVersion: 1;
  readonly createdAt: string;
  readonly checksum: string;
}

export interface QuoteSnapshotOptions {
  createdAt?: string;
}

const DEFAULT_DISCOUNT_THRESHOLD_PCT = 10;
const DEFAULT_TOTAL_THRESHOLD = 50000;

export function calculateLineTotal(line: QuoteLineInput, currency: string): Money {
  const discountPct = line.discountPct ?? 0;
  if (discountPct < 0 || discountPct > 100) {
    throw new RangeError(`Discount percent must be between 0 and 100, received ${discountPct}`);
  }
  const unitPrice = parseScaledDecimal(line.unitPrice);
  const quantity = parseScaledDecimal(line.quantity);
  const gross = multiplyScaledDecimals(unitPrice, quantity);
  const pct = parseScaledDecimal(discountPct);
  const scaledHundred: ScaledDecimal = { digits: 100n * pow10(pct.scale), scale: pct.scale };
  const retained: ScaledDecimal = {
    digits: scaledHundred.digits - pct.digits,
    scale: pct.scale,
  };
  // Retained share is (100 - pct) / 100; the /100 is carried exactly in the scale.
  const retainedShare: ScaledDecimal = { digits: retained.digits, scale: retained.scale + 2 };
  const net = multiplyScaledDecimals(gross, retainedShare);
  const rounded = roundScaledDecimal(net, currencyDecimals(currency), 'half_even');
  return new Money(rounded.digits, rounded.scale, currency);
}

export function calculateQuoteSubtotal(lines: readonly QuoteLineInput[], currency: string): Money {
  if (lines.length === 0) return Money.zero(currency);
  return Money.sum(lines.map((line) => calculateLineTotal(line, currency)));
}

export interface QuoteTotalsInput {
  lines: readonly QuoteLineInput[];
  shipping?: Money | string | number;
  insurance?: Money | string | number;
  tax?: Money | string | number;
  discount?: Money | string | number;
  currency: string;
}

export function calculateQuoteTotal(input: QuoteTotalsInput): Money {
  const subtotal = calculateQuoteSubtotal(input.lines, input.currency);
  const shipping = toMoneyAmount(input.shipping ?? 0, input.currency);
  const insurance = toMoneyAmount(input.insurance ?? 0, input.currency);
  const tax = toMoneyAmount(input.tax ?? 0, input.currency);
  const discount = toMoneyAmount(input.discount ?? 0, input.currency);
  const total = subtotal.add(shipping).add(insurance).add(tax).sub(discount);
  return total.isNegative() ? Money.zero(input.currency) : total;
}

// Strictly greater on both thresholds: exactly 10% or exactly 50,000 needs no approval.
export function requiresManagementApproval(
  discountPct: number,
  total: number,
  thresholds?: ApprovalThresholds,
): boolean {
  const discountLimit = thresholds?.discountPct ?? DEFAULT_DISCOUNT_THRESHOLD_PCT;
  const totalLimit = thresholds?.total ?? DEFAULT_TOTAL_THRESHOLD;
  return discountPct > discountLimit || total > totalLimit;
}

export function createQuoteSnapshot(input: QuoteSnapshotInput, options?: QuoteSnapshotOptions): QuoteSnapshot {
  const payload = {
    ...input,
    snapshotVersion: 1 as const,
    createdAt: options?.createdAt ?? new Date().toISOString(),
  };
  const snapshot: QuoteSnapshot = { ...payload, checksum: sha256(canonicalJsonStringify(payload)) };
  return Object.freeze(snapshot);
}

export function verifyQuoteSnapshot(snapshot: QuoteSnapshot): boolean {
  if (snapshot === null || typeof snapshot !== 'object' || typeof snapshot.checksum !== 'string') {
    return false;
  }
  const { checksum, ...payload } = snapshot;
  return sha256(canonicalJsonStringify(payload)) === checksum;
}

function toMoneyAmount(amount: Money | string | number, currency: string): Money {
  return amount instanceof Money ? amount : Money.from(amount, currency);
}
