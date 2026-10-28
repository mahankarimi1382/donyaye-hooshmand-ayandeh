import { z } from 'zod';

export const SHIPPING_MILESTONES = [
  'booking_confirmed',
  'cargo_received_at_port',
  'customs_cleared_export',
  'vessel_loaded',
  'vessel_departed',
  'in_transit',
  'arrived_destination_port',
  'customs_cleared_import',
  'delivered',
] as const;
export type ShipmentMilestone = (typeof SHIPPING_MILESTONES)[number];

export const ShipmentMilestoneSchema = z.enum(SHIPPING_MILESTONES);

export const TRADE_CASE_STATUSES = ['confirmed', 'in_execution', 'completed', 'cancelled'] as const;
export type TradeCaseStatus = (typeof TRADE_CASE_STATUSES)[number];

export const TradeCaseStatusSchema = z.enum(TRADE_CASE_STATUSES);

export const MilestoneAdvanceSchema = z.strictObject({
  caseId: z.string().trim().min(1).max(64),
  targetMilestone: ShipmentMilestoneSchema,
  location: z.string().trim().max(120).optional(),
  vesselName: z.string().trim().max(120).optional(),
  billOfLading: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
  expectedVersion: z.number().int().positive(),
});

export type MilestoneAdvanceInput = z.output<typeof MilestoneAdvanceSchema>;

export const CASE_CHECKLIST_ITEMS = [
  'sgs_draft_survey',
  'laboratory_assay',
  'export_customs_declaration',
  'clean_on_board_bl',
  'commercial_invoice',
] as const;
export type CaseChecklistItem = (typeof CASE_CHECKLIST_ITEMS)[number];

export const CaseChecklistItemSchema = z.enum(CASE_CHECKLIST_ITEMS);

export const ChecklistToggleSchema = z.strictObject({
  caseId: z.string().trim().min(1).max(64),
  item: CaseChecklistItemSchema,
  value: z.boolean(),
});

export type ChecklistToggleInput = z.output<typeof ChecklistToggleSchema>;
