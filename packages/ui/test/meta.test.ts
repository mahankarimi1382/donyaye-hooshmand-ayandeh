import { afterEach, describe, expect, it } from 'vitest';
import {
  CASE_STATUS_META,
  MILESTONE_META,
  QUOTE_STATUS_META,
  RFQ_STATUS_META,
  statusMeta,
  toneClasses,
  UNKNOWN_STATUS_META,
} from '../src/meta';

// Key sets must stay in lockstep with the state machines in @karvan/core
// (rfq-status.ts, quote-status.ts, shipment.ts, trade-case.ts).
describe('status meta maps', () => {
  it('covers the eleven RFQ statuses', () => {
    expect(Object.keys(RFQ_STATUS_META)).toEqual([
      'draft',
      'submitted',
      'under_review',
      'needs_information',
      'qualified',
      'quote_preparation',
      'quoted',
      'accepted',
      'rejected',
      'expired',
      'cancelled',
    ]);
  });

  it('covers the eight quote statuses', () => {
    expect(Object.keys(QUOTE_STATUS_META)).toEqual([
      'draft',
      'internal_review',
      'approved',
      'sent',
      'revised',
      'accepted',
      'declined',
      'expired',
    ]);
  });

  it('covers the nine shipment milestones', () => {
    expect(Object.keys(MILESTONE_META)).toEqual([
      'booking_confirmed',
      'cargo_received_at_port',
      'customs_cleared_export',
      'vessel_loaded',
      'vessel_departed',
      'in_transit',
      'arrived_destination_port',
      'customs_cleared_import',
      'delivered',
    ]);
  });

  it('covers the four trade case statuses', () => {
    expect(Object.keys(CASE_STATUS_META)).toEqual([
      'confirmed',
      'in_execution',
      'completed',
      'cancelled',
    ]);
  });

  it('follows the tone mapping from DESIGN_SPEC section 2', () => {
    expect(RFQ_STATUS_META.qualified.tone).toBe('harbor');
    expect(RFQ_STATUS_META.needs_information.tone).toBe('ochre');
    expect(RFQ_STATUS_META.rejected.tone).toBe('seal');
    expect(QUOTE_STATUS_META.approved.tone).toBe('clear');
    expect(MILESTONE_META.booking_confirmed.tone).toBe('harbor');
    expect(MILESTONE_META.delivered.tone).toBe('clear');
    expect(CASE_STATUS_META.in_execution.tone).toBe('ochre');
    expect(CASE_STATUS_META.confirmed.tone).toBe('observed');
  });

  it('falls back to the faded annotation meta for unknown values', () => {
    expect(statusMeta(RFQ_STATUS_META, 'no_such_status')).toBe(UNKNOWN_STATUS_META);
    expect(statusMeta(RFQ_STATUS_META, 'qualified').tone).toBe('harbor');
  });

  it('returns token-only classes per tone', () => {
    const harbor = toneClasses('harbor');
    expect(harbor).toEqual({ border: 'border-harbor', text: 'text-harbor', bg: 'bg-harbor/10' });
    const faint = toneClasses('ink-faint');
    expect(faint).toEqual({ border: 'border-rule', text: 'text-ink-faint', bg: 'bg-transparent' });
  });
});
