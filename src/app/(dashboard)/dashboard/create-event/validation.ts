import { z } from 'zod';

export const createEventSchema = z.object({
	name: z
		.string()
		.min(1, 'Event name is required')
		.max(100, 'Event name must be less than 100 characters'),
	description: z.string().optional(),
	date: z.date(),
});

export type CreateEventForm = z.infer<typeof createEventSchema>;
