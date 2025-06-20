'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators/signup';
import { calculateQueuePosition } from '@/lib/queue-logic';
import { PerformanceType, SignupStatus } from '@prisma/client';

// Type definition for the server action response
export type AddSingerResult = {
	success: boolean;
	message: string;
	queuePosition?: number;
	errors?: {
		singerName?: string[];
		singerName1?: string[];
		singerName2?: string[];
		singerName3?: string[];
		singerName4?: string[];
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
			performanceType: formData.get('performanceType'),
			singerName: formData.get('singerName') || undefined,
			singerName1: formData.get('singerName1') || undefined,
			singerName2: formData.get('singerName2') || undefined,
			singerName3: formData.get('singerName3') || undefined,
			singerName4: formData.get('singerName4') || undefined,
			songTitle: formData.get('songTitle'),
			artist: formData.get('artist'),
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

		const { data: validatedData } = validation;

		// Determine the singer name for the database based on performance type
		let dbSingerName: string;
		switch (validatedData.performanceType) {
			case 'SOLO':
				dbSingerName = validatedData.singerName!;
				break;
			case 'DUET':
				dbSingerName = `${validatedData.singerName1} & ${validatedData.singerName2}`;
				break;
			case 'GROUP':
				// Combine all non-empty singer names for group
				const groupSingers = [
					validatedData.singerName1,
					validatedData.singerName2,
					validatedData.singerName3,
					validatedData.singerName4,
				].filter((name) => name && name.trim().length > 0);
				dbSingerName = groupSingers.join(' & ');
				break;
		}

		// Fetch the current queue for this event (only QUEUED singers)
		const currentQueue = await prisma.signup.findMany({
			where: {
				eventId: eventId,
				status: SignupStatus.QUEUED,
			},
			orderBy: {
				position: 'asc',
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
			dbSingerName
		);

		// Create the new signup record
		await prisma.signup.create({
			data: {
				eventId: eventId,
				singerName: dbSingerName,
				songTitle: validatedData.songTitle,
				artist: validatedData.artist,
				performanceType: validatedData.performanceType as PerformanceType,
				status: SignupStatus.QUEUED,
				position: queuePosition,
			},
		});

		// After inserting the new signup, we need to update positions of subsequent entries
		// to maintain sequential order (no gaps in positions) for QUEUED singers only
		await prisma.$transaction(async (tx) => {
			// Get all QUEUED signups for this event, ordered by position
			const allQueuedSignups = await tx.signup.findMany({
				where: {
					eventId: eventId,
					status: SignupStatus.QUEUED,
				},
				orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
			});

			// Reassign positions sequentially starting from 1 (only for QUEUED)
			for (let i = 0; i < allQueuedSignups.length; i++) {
				const correctPosition = i + 1;
				if (allQueuedSignups[i].position !== correctPosition) {
					await tx.signup.update({
						where: { id: allQueuedSignups[i].id },
						data: { position: correctPosition },
					});
				}
			}
		});

		// Revalidate the event page to update the queue display
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
}
