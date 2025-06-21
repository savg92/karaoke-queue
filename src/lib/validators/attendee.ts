import { z } from 'zod';

// Shared validation schemas for signup forms
export const baseSignupSchema = z.object({
	singerName: z
		.string()
		.min(1, 'Singer name is required')
		.max(100, 'Singer name must be less than 100 characters'),
	songTitle: z
		.string()
		.min(1, 'Song title is required')
		.max(200, 'Song title must be less than 200 characters'),
	artist: z
		.string()
		.min(1, 'Artist is required')
		.max(100, 'Artist name must be less than 100 characters'),
	notes: z
		.string()
		.max(500, 'Notes must be less than 500 characters')
		.optional(),
});

export const performanceTypeSchema = z.enum(['SOLO', 'DUET', 'GROUP'], {
	required_error: 'Please select a performance type',
});

// Host add attendee schema (simplified for manual addition)
export const addAttendeeSchema = z
	.object({
		performanceType: performanceTypeSchema,
		singerName: z.string().max(100).optional(),
		singerName1: z.string().max(100).optional(),
		singerName2: z.string().max(100).optional(),
		singerName3: z.string().max(100).optional(),
		songTitle: z.string().min(1).max(200),
		artist: z.string().min(1).max(100),
		notes: z.string().max(500).optional(),
	})
	.refine(
		(data) => {
			if (data.performanceType === 'SOLO') return !!data.singerName;
			if (data.performanceType === 'DUET')
				return !!data.singerName1 && !!data.singerName2;
			if (data.performanceType === 'GROUP')
				return !!data.singerName1 && !!data.singerName2 && !!data.singerName3;
			return false;
		},
		{
			message:
				'Please fill in all required singer names for the performance type',
		}
	);

export type AddAttendeeFormData = z.infer<typeof addAttendeeSchema>;
