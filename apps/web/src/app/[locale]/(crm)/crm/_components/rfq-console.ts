import { RFQ_STATUS_VALUES } from '@karvan/core';
import type { RfqStatus } from '@karvan/core';
import { RFQ_STATUS_META, statusMeta, toneClasses } from '@karvan/ui';
import type { StatusTone } from '@karvan/ui';

/*
 * Server-side helpers shared by the CRM inbox and RFQ detail pages.
 * SLA urgency: breach once past the deadline, urgent inside the final 6 hours.
 */

export const RFQ_ACTIONS_BY_PAIR: Record<string, string> = {
  'draft>submitted': 'SUBMIT_RFQ',
  'submitted>under_review': 'ASSIGN_LEAD',
  'submitted>rejected': 'REJECT_LEAD',
  'submitted>cancelled': 'CANCEL_RFQ',
  'under_review>needs_information': 'REQUEST_INFO',
  'under_review>qualified': 'QUALIFY_RFQ',
  'under_review>rejected': 'REJECT_RFQ',
  'under_review>cancelled': 'CANCEL_RFQ',
  'needs_information>under_review': 'PROVIDE_INFO',
  'needs_information>expired': 'EXPIRE_RFQ',
  'needs_information>cancelled': 'CANCEL_RFQ',
  'qualified>quote_preparation': 'START_PRICING',
  'qualified>rejected': 'REJECT_RFQ',
  'qualified>cancelled': 'CANCEL_RFQ',
  'quote_preparation>quoted': 'DISPATCH_QUOTE',
  'quote_preparation>rejected': 'REJECT_RFQ',
  'quote_preparation>cancelled': 'CANCEL_RFQ',
  'quoted>accepted': 'ACCEPT_DEAL',
  'quoted>quote_preparation': 'REQUEST_REVISION',
  'quoted>rejected': 'REJECT_RFQ',
  'quoted>expired': 'EXPIRE_RFQ',
  'quoted>cancelled': 'CANCEL_RFQ',
};

/* Buyer-side moves: mirrored in the portal, never posted from the CRM console. */
export const BUYER_SIDE_RFQ_ACTIONS: ReadonlySet<string> = new Set([
  'SUBMIT_RFQ',
  'PROVIDE_INFO',
  'ACCEPT_DEAL',
  'REQUEST_REVISION',
]);

export interface RfqTransitionOption {
  to: RfqStatus;
  action: string;
}

export function rfqTransitionOptions(status: RfqStatus): readonly RfqTransitionOption[] {
  return RFQ_STATUS_VALUES.filter((to) => RFQ_ACTIONS_BY_PAIR[`${status}>${to}`] !== undefined).map((to) => ({
    to,
    action: RFQ_ACTIONS_BY_PAIR[`${status}>${to}`],
  }));
}

export type SlaState = 'ok' | 'urgent' | 'breach';

const URGENT_WINDOW_MS = 6 * 60 * 60 * 1000;

export function slaStateOf(deadlineIso: string, now: number): {state: SlaState; remainingMs: number} {
  const remainingMs = new Date(deadlineIso).getTime() - now;
  if (remainingMs <= 0) return {state: 'breach', remainingMs};
  if (remainingMs <= URGENT_WINDOW_MS) return {state: 'urgent', remainingMs};
  return {state: 'ok', remainingMs};
}

export const SLA_TONE_CLASS: Record<SlaState, string> = {
  ok: 'text-clear',
  urgent: 'text-ochre',
  breach: 'text-seal',
};

/* Mono countdown label, Latin digits: T-07:41 until the deadline, T+ after. */
export function slaCountdownLabel(remainingMs: number): string {
  const sign = remainingMs < 0 ? '+' : '-';
  const absolute = Math.abs(remainingMs);
  const totalMinutes = Math.floor(absolute / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `T${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function rfqStatusTone(status: RfqStatus): {tone: StatusTone; borderClass: string; textClass: string} {
  const meta = statusMeta(RFQ_STATUS_META, status);
  const classes = toneClasses(meta.tone);
  return {tone: meta.tone, borderClass: classes.border, textClass: classes.text};
}

export const ACTIVE_RFQ_STATUSES: readonly RfqStatus[] = [
  'submitted',
  'under_review',
  'needs_information',
  'qualified',
  'quote_preparation',
  'quoted',
  'accepted',
];

/* Statuses whose SLA deadline still governs the operator's queue. */
const SLA_GOVERNING_STATUSES: ReadonlySet<RfqStatus> = new Set<RfqStatus>([
  'submitted',
  'under_review',
  'needs_information',
]);

export function slaGoverns(status: RfqStatus): boolean {
  return SLA_GOVERNING_STATUSES.has(status);
}
