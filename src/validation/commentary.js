import { z } from 'zod';

export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createCommentarySchema = z.object({
  minutes: z.coerce.number().int().nonnegative(),
  sequence: z.any().optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1, 'Message must be a non-empty string'),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
}).transform((data) => ({
  minute: data.minutes,
  sequence: data.sequence,
  period: data.period,
  eventType: data.eventType,
  actor: data.actor,
  team: data.team,
  message: data.message,
  metadata: data.metadata,
  tags: data.tags,
}));