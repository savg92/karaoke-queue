import { prisma } from '@/lib/prisma';
import { SignupStatus } from '@prisma/client';

/**
 * Recalculates queue positions for QUEUED signups in an event.
 * Only QUEUED signups should have positions. PERFORMING, COMPLETE, and CANCELLED should have position 0.
 */
export async function recalculateEventQueuePositions(eventId: string) {
	await prisma.$transaction(async (tx) => {
		// First, set all non-QUEUED signups to position 0
		await tx.signup.updateMany({
			where: {
				eventId,
				status: {
					not: SignupStatus.QUEUED,
				},
			},
			data: { position: 0 },
		});

		// Then, get all QUEUED signups ordered by creation time
		const queuedSignups = await tx.signup.findMany({
			where: {
				eventId,
				status: SignupStatus.QUEUED,
			},
			orderBy: {
				createdAt: 'asc', // Maintain fairness by creation order
			},
		});

		// Update each QUEUED signup with new sequential positions
		for (let i = 0; i < queuedSignups.length; i++) {
			await tx.signup.update({
				where: { id: queuedSignups[i].id },
				data: { position: i + 1 },
			});
		}
	});
}

/**
 * Gets the next available queue position for a signup
 */
export async function getNextQueuePosition(eventId: string): Promise<number> {
	const maxPosition = await prisma.signup.findFirst({
		where: {
			eventId,
			status: SignupStatus.QUEUED,
		},
		orderBy: {
			position: 'desc',
		},
		select: {
			position: true,
		},
	});

	return (maxPosition?.position || 0) + 1;
}
