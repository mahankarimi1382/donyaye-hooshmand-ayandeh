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

const MILESTONE_INDEX: ReadonlyMap<string, number> = new Map(
  SHIPPING_MILESTONES.map((milestone, index) => [milestone, index] as const),
);

export class InvalidMilestoneAdvanceError extends Error {
  readonly code = 'invalid_milestone_advance';
  readonly current: string;
  readonly target: string;

  constructor(current: string, target: string, message?: string) {
    super(
      message
        ?? `Shipment milestones are forward-only: cannot advance from "${current}" to "${target}".`,
    );
    this.name = 'InvalidMilestoneAdvanceError';
    this.current = current;
    this.target = target;
  }
}

export function isShipmentMilestone(value: unknown): value is ShipmentMilestone {
  return typeof value === 'string' && MILESTONE_INDEX.has(value);
}

export function milestoneIndex(milestone: ShipmentMilestone): number {
  const index = MILESTONE_INDEX.get(milestone);
  if (index === undefined) {
    throw new InvalidMilestoneAdvanceError(milestone, milestone, `Unknown shipment milestone: "${milestone}"`);
  }
  return index;
}

// Skipping forward is allowed; stepping backwards or repeating a milestone is not.
export function assertMilestoneAdvance(current: ShipmentMilestone, target: ShipmentMilestone): void {
  const currentIndex = MILESTONE_INDEX.get(current);
  const targetIndex = MILESTONE_INDEX.get(target);
  if (currentIndex === undefined || targetIndex === undefined) {
    throw new InvalidMilestoneAdvanceError(
      current,
      target,
      `Unknown shipment milestone: "${currentIndex === undefined ? current : target}"`,
    );
  }
  if (targetIndex <= currentIndex) {
    throw new InvalidMilestoneAdvanceError(current, target);
  }
}

export function canAdvanceMilestone(current: ShipmentMilestone, target: ShipmentMilestone): boolean {
  const currentIndex = MILESTONE_INDEX.get(current);
  const targetIndex = MILESTONE_INDEX.get(target);
  return currentIndex !== undefined && targetIndex !== undefined && targetIndex > currentIndex;
}
