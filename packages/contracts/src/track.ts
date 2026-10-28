import { z } from 'zod';

export const TrackQuerySchema = z.strictObject({
  reference: z.string().trim().min(6).max(64),
  email: z.email().optional(),
});

export type TrackQuery = z.output<typeof TrackQuerySchema>;
