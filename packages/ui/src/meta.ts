import type { LucideIcon } from 'lucide-react';
import {
  Anchor,
  BadgeCheck,
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  Container,
  CircleHelp,
  FileCheck,
  FileCheck2,
  FileClock,
  FilePen,
  FileSearch,
  FileText,
  MapPin,
  MessageCircleQuestion,
  OctagonX,
  PackageCheck,
  PenLine,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  Ship,
  ShipWheel,
  Stamp,
  Truck,
  Undo2,
  Warehouse,
  ClipboardList,
} from 'lucide-react';

export type StatusTone = 'ink-faint' | 'observed' | 'ochre' | 'harbor' | 'clear' | 'seal';

export interface StatusMetaEntry {
  tone: StatusTone;
  icon: LucideIcon;
}

export interface ToneClasses {
  border: string;
  text: string;
  bg: string;
}

/*
 * Status -> color mapping from DESIGN_SPEC §2, keyed by the exact status
 * values of the state machines in @karvan/core (rfq-status, quote-status,
 * shipment, trade-case). Labels are supplied by the caller, never imported
 * from i18n.
 */

export const RFQ_STATUS_META = {
  draft: { tone: 'ink-faint', icon: FileText },
  submitted: { tone: 'observed', icon: ClipboardList },
  under_review: { tone: 'observed', icon: FileSearch },
  needs_information: { tone: 'ochre', icon: MessageCircleQuestion },
  qualified: { tone: 'harbor', icon: ShieldCheck },
  quote_preparation: { tone: 'ochre', icon: FilePen },
  quoted: { tone: 'harbor', icon: Receipt },
  accepted: { tone: 'clear', icon: FileCheck },
  rejected: { tone: 'seal', icon: OctagonX },
  expired: { tone: 'ink-faint', icon: FileClock },
  cancelled: { tone: 'ink-faint', icon: Ban },
} as const satisfies Record<string, StatusMetaEntry>;

export type RfqStatusKey = keyof typeof RFQ_STATUS_META;

export const QUOTE_STATUS_META = {
  draft: { tone: 'ink-faint', icon: PenLine },
  internal_review: { tone: 'ochre', icon: Search },
  approved: { tone: 'clear', icon: Stamp },
  sent: { tone: 'harbor', icon: Send },
  revised: { tone: 'ink-faint', icon: Undo2 },
  accepted: { tone: 'clear', icon: FileCheck },
  declined: { tone: 'seal', icon: CircleX },
  expired: { tone: 'ink-faint', icon: Clock },
} as const satisfies Record<string, StatusMetaEntry>;

export type QuoteStatusKey = keyof typeof QUOTE_STATUS_META;

export const MILESTONE_META = {
  booking_confirmed: { tone: 'harbor', icon: Anchor },
  cargo_received_at_port: { tone: 'observed', icon: Warehouse },
  customs_cleared_export: { tone: 'clear', icon: FileCheck },
  vessel_loaded: { tone: 'observed', icon: Container },
  vessel_departed: { tone: 'harbor', icon: ShipWheel },
  in_transit: { tone: 'observed', icon: Ship },
  arrived_destination_port: { tone: 'observed', icon: MapPin },
  customs_cleared_import: { tone: 'clear', icon: FileCheck2 },
  delivered: { tone: 'clear', icon: PackageCheck },
} as const satisfies Record<string, StatusMetaEntry>;

export type MilestoneKey = keyof typeof MILESTONE_META;

export const CASE_STATUS_META = {
  confirmed: { tone: 'observed', icon: BadgeCheck },
  in_execution: { tone: 'ochre', icon: Truck },
  completed: { tone: 'clear', icon: CircleCheck },
  cancelled: { tone: 'ink-faint', icon: Ban },
} as const satisfies Record<string, StatusMetaEntry>;

export type CaseStatusKey = keyof typeof CASE_STATUS_META;

/* Fallback for values outside the known machines — faded annotation ink. */
export const UNKNOWN_STATUS_META: StatusMetaEntry = { tone: 'ink-faint', icon: CircleHelp };

export function statusMeta(
  map: Record<string, StatusMetaEntry>,
  status: string,
): StatusMetaEntry {
  return map[status] ?? UNKNOWN_STATUS_META;
}

/* Tone -> token classes. Only token-backed utilities, never raw colors. */
const TONE_CLASSES: Record<StatusTone, ToneClasses> = {
  'ink-faint': { border: 'border-rule', text: 'text-ink-faint', bg: 'bg-transparent' },
  observed: { border: 'border-observed', text: 'text-observed', bg: 'bg-observed/10' },
  ochre: { border: 'border-ochre', text: 'text-ochre', bg: 'bg-ochre/10' },
  harbor: { border: 'border-harbor', text: 'text-harbor', bg: 'bg-harbor/10' },
  clear: { border: 'border-clear', text: 'text-clear', bg: 'bg-clear/10' },
  seal: { border: 'border-seal', text: 'text-seal', bg: 'bg-seal/10' },
};

export function toneClasses(tone: StatusTone): ToneClasses {
  return TONE_CLASSES[tone];
}
