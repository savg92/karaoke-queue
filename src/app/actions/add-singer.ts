'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators/signup';
import { calculateQueuePosition } from '@/lib/queue-logic';

// Type definition for the server action response
export type AddSingerResult = {
	success: boolean;
	message: string;
	queuePosition?: number;
	errors?: {
		singerName?: string[];
		songTitle?: string[];
		artist?: string[];
		performanceType?: string[];
		notes?: string[];
		_form?: string[];
	};
};

/**
 * Server action to add a new singer to the karaoke queue.
 * This function validates the input, calculates the optimal queue position,
 * and creates a new signup record in the database.
 */
export async function addSinger(
	eventId: string,
	formData: FormData
): Promise<AddSingerResult> {
	try {
		// Extract and validate form data
		const rawData = {
			singerName: formData.get('singerName'),
			songTitle: formData.get('songTitle'),
			artist: formData.get('artist'),
			performanceType: formData.get('performanceType'),
			notes: formData.get('notes') || '',
		};

		// Validate the input using our Zod schema
		const validation = signupSchema.safeParse(rawData);

		if (!validation.success) {
			return {
				success: false,
				message: 'Please check the form for errors.',
				errors: validation.error.flatten().fieldErrors,
			};
		}

		const validatedData = validation.data;

		// Fetch the current queue for this event
		const currentQueue = await prisma.signup.findMany({
			where: {
				eventId: eventId,
				status: {
					in: ['QUEUED', 'PERFORMING'],
				},
			},
			orderBy: {
				createdAt: 'asc',
			},
			select: {
				id: true,
				singerName: true,
				position: true,
				createdAt: true,
			},
		});

		// Calculate the optimal queue position using our fairness algorithm
		const queuePosition = calculateQueuePosition(
			currentQueue.map((entry) => ({
				...entry,
				queuePosition: entry.position,
			})),
			validatedData.singerName
		);

		// Create the new signup record
		await prisma.signup.create({
			data: {
				eventId: eventId,
				singerName: validatedData.singerName,
				songTitle: validatedData.songTitle,
				artist: validatedData.artist,
				performanceType: validatedData.performanceType,
				notes: validatedData.notes,
				status: 'QUEUED',
				position: queuePosition,
			},
		});

		// Revalidate the event page to update the queue display
		// Note: We'll revalidate both the event page and any dashboard pages
		revalidatePath(`/event/[eventSlug]`, 'page');
		revalidatePath(`/dashboard/[eventSlug]`, 'page');

		return {
			success: true,
			message: `Successfully added to the queue at position ${queuePosition}!`,
			queuePosition: queuePosition,
		};
	} catch (error) {
		console.error('Error adding singer to queue:', error);

		return {
			success: false,
			message: 'Something went wrong. Please try again.',
			errors: {
				_form: ['Unable to add you to the queue. Please try again.'],
			},
		};
	}
}
