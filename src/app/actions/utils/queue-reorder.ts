import { prisma } from '@/lib/prisma';
import { SignupStatus } from '@prisma/client';

export async function reorderQueuePositions(eventId: string) {
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
}
