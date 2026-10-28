import { describe, expect, it } from 'vitest';
import {
  InvalidMilestoneAdvanceError,
  SHIPPING_MILESTONES,
  assertMilestoneAdvance,
  canAdvanceMilestone,
  isShipmentMilestone,
  milestoneIndex,
} from '../src';
import type { ShipmentMilestone } from '../src';

type DomainError = Error & { code?: string };

function captureError(run: () => unknown): DomainError {
  try {
    run();
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('Expected the call to throw');
}

const MILESTONE_LIST: readonly ShipmentMilestone[] = [
  'booking_confirmed',
  'cargo_received_at_port',
  'customs_cleared_export',
  'vessel_loaded',
  'vessel_departed',
  'in_transit',
  'arrived_destination_port',
  'customs_cleared_import',
  'delivered',
];

describe('Shipment milestones', () => {
  it('declares the nine milestones in order', () => {
    expect(SHIPPING_MILESTONES).toEqual(MILESTONE_LIST);
  });

  it('indexes each milestone', () => {
    MILESTONE_LIST.forEach((milestone, index) => {
      expect(milestoneIndex(milestone)).toBe(index);
      expect(isShipmentMilestone(milestone)).toBe(true);
    });
    expect(isShipmentMilestone('warehouse_pickup')).toBe(false);
  });

  it('advances step by step', () => {
    for (let index = 0; index < MILESTONE_LIST.length - 1; index += 1) {
      const current = MILESTONE_LIST[index];
      const next = MILESTONE_LIST[index + 1];
      expect(canAdvanceMilestone(current, next)).toBe(true);
      expect(() => assertMilestoneAdvance(current, next)).not.toThrow();
    }
  });

  it('allows skipping forward', () => {
    expect(() => assertMilestoneAdvance('booking_confirmed', 'vessel_departed')).not.toThrow();
    expect(() => assertMilestoneAdvance('vessel_departed', 'delivered')).not.toThrow();
    expect(canAdvanceMilestone('customs_cleared_export', 'customs_cleared_import')).toBe(true);
    expect(canAdvanceMilestone('booking_confirmed', 'delivered')).toBe(true);
  });

  it('rejects backwards and repeated milestones', () => {
    const backwards: ReadonlyArray<readonly [ShipmentMilestone, ShipmentMilestone]> = [
      ['delivered', 'booking_confirmed'],
      ['in_transit', 'vessel_loaded'],
      ['arrived_destination_port', 'customs_cleared_export'],
    ];
    for (const [current, target] of backwards) {
      expect(canAdvanceMilestone(current, target)).toBe(false);
      const error = captureError(() => assertMilestoneAdvance(current, target));
      expect(error).toBeInstanceOf(InvalidMilestoneAdvanceError);
      expect(error.code).toBe('invalid_milestone_advance');
      const advanceError = error as InvalidMilestoneAdvanceError;
      expect(advanceError.current).toBe(current);
      expect(advanceError.target).toBe(target);
    }
    const repeatError = captureError(() => assertMilestoneAdvance('in_transit', 'in_transit'));
    expect(repeatError.code).toBe('invalid_milestone_advance');
    expect(canAdvanceMilestone('delivered', 'delivered')).toBe(false);
  });

  it('rejects unknown milestones', () => {
    const error = captureError(() =>
      assertMilestoneAdvance('in_transit', 'warehouse_pickup' as ShipmentMilestone),
    );
    expect(error).toBeInstanceOf(InvalidMilestoneAdvanceError);
    expect(error.code).toBe('invalid_milestone_advance');
    expect(canAdvanceMilestone('warehouse_pickup' as ShipmentMilestone, 'delivered')).toBe(false);
  });
});
