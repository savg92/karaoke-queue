import { z } from 'zod';

// Validation schema for the signup form
// This ensures all user input is properly validated before being processed
export const signupSchema = z.object({
	singerName: z
		.string()
		.min(1, 'Singer name is required')
		.max(100, 'Singer name must be less than 100 characters')
		.trim(),

	songTitle: z
		.string()
		.min(1, 'Song title is required')
		.max(200, 'Song title must be less than 200 characters')
		.trim(),

	artist: z
		.string()
		.min(1, 'Artist name is required')
		.max(200, 'Artist name must be less than 200 characters')
		.trim(),

	performanceType: z.enum(['SOLO', 'DUET', 'GROUP'], {
		required_error: 'Please select a performance type',
	}),

	notes: z
		.string()
		.max(500, 'Notes must be less than 500 characters')
		.optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;
