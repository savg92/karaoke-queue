'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators/signup';
import { calculateQueuePosition } from '@/lib/queue-logic';
import { AddSingerResult } from './types/add-singer';
import { extractFormData, ValidatedSignupData } from './utils/form-data';
import { buildSingerName } from './utils/singer-name';
import { getCurrentQueue } from './utils/queue-data';
import { createSignup } from './utils/signup-creation';
import { reorderQueuePositions } from './utils/queue-reorder';
import { withSecurity } from '@/lib/security/security-wrapper';

/**
 * Server action to add a new singer to the karaoke queue.
 * This function validates the input, calculates the optimal queue position,
 * and creates a new signup record in the database.
 */
const addSingerUnsecured = async (
	eventId: string,
	formData: FormData
): Promise<AddSingerResult> => {
	try {
		// Extract and validate form data
		const rawData = extractFormData(formData);
		const validation = signupSchema.safeParse(rawData);

		if (!validation.success) {
			return {
				success: false,
				message: 'Please check the form for errors.',
				errors: validation.error.flatten().fieldErrors,
			};
		}

		const validatedData = validation.data as ValidatedSignupData;
		const singerName = buildSingerName(validatedData);

		// Get current queue and calculate position
		const currentQueue = await getCurrentQueue(eventId);
		const queuePosition = calculateQueuePosition(
			currentQueue.map((entry) => ({
				...entry,
				queuePosition: entry.position,
			})),
			singerName
		); // Create signup and reorder positions
		await createSignup(eventId, singerName, validatedData, queuePosition);
		await reorderQueuePositions(eventId);

		// Revalidate event pages
		const event = await prisma.event.findUnique({
			where: { id: eventId },
			select: { slug: true },
		});

		if (event) {
			revalidatePath(`/event/${event.slug}`);
			revalidatePath(`/dashboard/${event.slug}`);
		}

		return {
			success: true,
			message: `Successfully added to the queue! You are number ${queuePosition}.`,
			queuePosition: queuePosition,
		};
	} catch (error) {
		console.error('Error adding singer:', error);
		return {
			success: false,
			message: 'An unexpected error occurred. Please try again later.',
		};
	}
};

// Apply security wrapper with rate limiting and injection detection
export const addSinger = withSecurity(addSingerUnsecured, {
	rateLimiter: 'signup',
	checkInjection: true,
});
