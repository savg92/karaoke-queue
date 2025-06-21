import { z } from 'zod';

/**
 * Schema for manually adding attendees by host
 * Matches original signup validation but simplified for admin use
 */
export const addAttendeeSchema = z
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
						code: z.ZodIssueCode.custom,
						message: 'Singer name is required for solo performances',
						path: ['singerName'],
					});
				}
				break;
			case 'DUET':
				if (!data.singerName1 || data.singerName1.trim().length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "First singer's name is required for duets",
						path: ['singerName1'],
					});
				}
				if (!data.singerName2 || data.singerName2.trim().length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Second singer's name is required for duets",
						path: ['singerName2'],
					});
				}
				break;
			case 'GROUP':
				const groupSingers = [
					data.singerName1,
					data.singerName2,
					data.singerName3,
					data.singerName4,
				].filter((name) => name && name.trim().length > 0);

				if (groupSingers.length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message:
							'At least one singer name is required for group performances',
						path: ['singerName1'],
					});
				}
				break;
		}
	});

export type AddAttendeeFormData = z.infer<typeof addAttendeeSchema>;

export const addAttendeeDefaults: AddAttendeeFormData = {
	performanceType: 'SOLO',
	singerName: '',
	singerName1: '',
	singerName2: '',
	singerName3: '',
	singerName4: '',
	songTitle: '',
	artist: '',
	notes: '',
};
