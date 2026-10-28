import { describe, expect, it } from 'vitest';

import {
  CASE_CHECKLIST_ITEMS,
  ChecklistToggleSchema,
  MilestoneAdvanceSchema,
  SHIPPING_MILESTONES,
  TRADE_CASE_STATUSES,
} from '../src';

describe('milestone vocabulary', () => {
  it('carries the nine forward-only shipment milestones in order', () => {
    expect([...SHIPPING_MILESTONES]).toEqual([
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
    expect([...TRADE_CASE_STATUSES]).toEqual([
      'confirmed',
      'in_execution',
      'completed',
      'cancelled',
    ]);
    expect([...CASE_CHECKLIST_ITEMS]).toHaveLength(5);
  });
});

describe('MilestoneAdvanceSchema', () => {
  it('accepts a forward advance with vessel evidence', () => {
    expect(
      MilestoneAdvanceSchema.safeParse({
        caseId: 'tc_01',
        targetMilestone: 'vessel_loaded',
        location: 'Bandar Abbas',
        vesselName: 'MV Karvan Star',
        billOfLading: 'KVL-BL-1405-0184',
        notes: 'All containers on board.',
        expectedVersion: 2,
      }).success,
    ).toBe(true);
    expect(
      MilestoneAdvanceSchema.safeParse({
        caseId: 'tc_01',
        targetMilestone: 'in_transit',
        expectedVersion: 3,
      }).success,
    ).toBe(true);
  });

  it('rejects unknown milestones and non-positive versions', () => {
    expect(
      MilestoneAdvanceSchema.safeParse({
        caseId: 'tc_01',
        targetMilestone: 'delayed_at_port',
        expectedVersion: 1,
      }).success,
    ).toBe(false);
    expect(
      MilestoneAdvanceSchema.safeParse({
        caseId: 'tc_01',
        targetMilestone: 'delivered',
        expectedVersion: 0,
      }).success,
    ).toBe(false);
  });

  it('bounds the optional shipment annotations', () => {
    expect(
      MilestoneAdvanceSchema.safeParse({
        caseId: 'tc_01',
        targetMilestone: 'vessel_departed',
        vesselName: 'V'.repeat(121),
        expectedVersion: 1,
      }).success,
    ).toBe(false);
    expect(
      MilestoneAdvanceSchema.safeParse({
        caseId: 'tc_01',
        targetMilestone: 'vessel_departed',
        billOfLading: 'B'.repeat(121),
        expectedVersion: 1,
      }).success,
    ).toBe(false);
  });
});

describe('ChecklistToggleSchema', () => {
  it('toggles one of the five checklist items', () => {
    for (const item of CASE_CHECKLIST_ITEMS) {
      expect(
        ChecklistToggleSchema.safeParse({ caseId: 'tc_01', item, value: true }).success,
      ).toBe(true);
    }
    expect(
      ChecklistToggleSchema.safeParse({ caseId: 'tc_01', item: 'packing_list', value: true }).success,
    ).toBe(false);
    expect(
      ChecklistToggleSchema.safeParse({ caseId: 'tc_01', item: 'laboratory_assay', value: 'yes' })
        .success,
    ).toBe(false);
  });
});
