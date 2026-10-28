import { z } from 'zod';

export const MarkNotificationsReadSchema = z.strictObject({
  ids: z.array(z.string().trim().min(1).max(64)).max(200).optional(),
});

export type MarkNotificationsReadInput = z.output<typeof MarkNotificationsReadSchema>;
