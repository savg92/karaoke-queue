import { prisma } from '@/lib/prisma';

/**
 * Recalculates queue positions for QUEUED signups in an event using batch operations.
 * Only QUEUED signups should have positions. PERFORMING, COMPLETE, and CANCELLED should have position 0.
 */
export async function recalculateEventQueuePositions(eventId: string) {
	await prisma.$transaction(async (tx: typeof prisma) => {
		// First, set all non-QUEUED signups to position 0 in a single batch operation
		await tx.signup.updateMany({
			where: {
				eventId,
				status: {
					not: 'QUEUED',
				},
			},
			data: { position: 0 },
		});

		// Then, get all QUEUED signups ordered by creation time
		const queuedSignups = await tx.signup.findMany({
			where: {
				eventId,
				status: 'QUEUED',
			},
			orderBy: {
				createdAt: 'asc', // Maintain fairness by creation order
			},
			select: {
				id: true, // Only select what we need
			},
		});

		// Use a single batch operation to update all positions
		// Build the update operations
		const updateOperations = queuedSignups.map((signup: { id: string }, index: number) =>
			tx.signup.update({
				where: { id: signup.id },
				data: { position: index + 1 },
			})
		);

		// Execute all updates in parallel within the transaction
		await Promise.all(updateOperations);
	});
}

/**
 * Gets the next available queue position for a signup
 */
export async function getNextQueuePosition(eventId: string): Promise<number> {
	const result = await prisma.signup.aggregate({
		where: {
			eventId,
			status: 'QUEUED',
		},
		_max: {
			position: true,
		},
	});

	return (result._max.position || 0) + 1;
}
