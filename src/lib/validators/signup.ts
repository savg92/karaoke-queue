import { z } from 'zod';

// Validation schema for the signup form
// This ensures all user input is properly validated before being processed
export const signupSchema = z
	.object({
		performanceType: z.enum(['SOLO', 'DUET', 'GROUP'], {
			required_error: 'Please select a performance type',
		}),

		singerName: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),

		singerName1: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		singerName2: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		singerName3: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		singerName4: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),

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

		notes: z
			.string()
			.max(500, 'Notes must be less than 500 characters')
			.optional(),
	})
	.superRefine((data, ctx) => {
		switch (data.performanceType) {
			case 'SOLO':
				if (!data.singerName || data.singerName.trim().length === 0) {
					ctx.addIssue({
						code: 'custom',
						path: ['singerName'],
						message: 'Your name is required.',
					});
				}
				break;
			case 'DUET':
				if (!data.singerName1 || data.singerName1.trim().length === 0) {
					ctx.addIssue({
						code: 'custom',
						path: ['singerName1'],
						message: "Singer 1's name is required.",
					});
				}
				if (!data.singerName2 || data.singerName2.trim().length === 0) {
					ctx.addIssue({
						code: 'custom',
						path: ['singerName2'],
						message: "Singer 2's name is required.",
					});
				}
				break;
			case 'GROUP':
				// Require at least one singer name for group
				const groupSingers = [
					data.singerName1,
					data.singerName2,
					data.singerName3,
					data.singerName4,
				].filter((name) => name && name.trim().length > 0);

				if (groupSingers.length === 0) {
					ctx.addIssue({
						code: 'custom',
						path: ['singerName1'],
						message:
							'At least one singer name is required for a group performance.',
					});
				}
				break;
		}
	});

export type SignupFormData = z.infer<typeof signupSchema>;
