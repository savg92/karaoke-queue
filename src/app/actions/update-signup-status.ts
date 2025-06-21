'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SignupStatus } from '@prisma/client';
import { verifySignupAccess } from './utils/auth-verification';
import {
	recalculateEventQueuePositions,
	getNextQueuePosition,
} from './utils/queue-positions';

export async function updateSignupStatus(
	signupId: string,
	status: SignupStatus
) {
	try {
		// Verify authorization and get signup data
		const signup = await verifySignupAccess(signupId);

		// Prepare update data
		const updateData: {
			status: SignupStatus;
			performingAt?: Date | null;
		} = { status };

		// Handle special logic for PERFORMING status
		if (status === SignupStatus.PERFORMING) {
			updateData.performingAt = new Date();

			// Complete any current performers before marking this one as performing
			await completeCurrentPerformers(signup.eventId, signupId);
		}
		// Clear performingAt when setting back to queued or other statuses
		else if (status === SignupStatus.QUEUED) {
			updateData.performingAt = null;
		}

		// Update the signup status
		await prisma.signup.update({
			where: { id: signupId },
			data: updateData,
		});

		// Handle position assignment when restoring to queue
		if (status === SignupStatus.QUEUED) {
			const nextPosition = await getNextQueuePosition(signup.eventId);
			await prisma.signup.update({
				where: { id: signupId },
				data: { position: nextPosition },
			});
		}

		// Recalculate positions if status change affects queue
		if (shouldRecalculatePositions(status)) {
			await recalculateEventQueuePositions(signup.eventId);
		}

		// Revalidate the dashboard page
		revalidatePath(`/dashboard/${signup.event.slug}`);

		return { success: true };
	} catch (error) {
		console.error('Error updating signup status:', error);
		throw error;
	}
}

async function completeCurrentPerformers(
	eventId: string,
	excludeSignupId: string
) {
	const currentPerformers = await prisma.signup.findMany({
		where: {
			eventId,
			status: SignupStatus.PERFORMING,
			id: { not: excludeSignupId },
		},
	});

	for (const performer of currentPerformers) {
		await prisma.signup.update({
			where: { id: performer.id },
			data: {
				status: SignupStatus.COMPLETE,
			},
		});
	}
}

function shouldRecalculatePositions(status: SignupStatus): boolean {
	const statusesToRecalculate: SignupStatus[] = [
		SignupStatus.PERFORMING,
		SignupStatus.COMPLETE,
		SignupStatus.CANCELLED,
	];
	return statusesToRecalculate.includes(status);
}
