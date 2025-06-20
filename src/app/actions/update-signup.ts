'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SignupStatus } from '@prisma/client';

/**
 * Recalculates queue positions for QUEUED signups in an event.
 * Only QUEUED signups should have positions. PERFORMING, COMPLETE, and CANCELLED should have position 0.
 */
async function recalculateEventQueuePositions(eventId: string) {
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

export async function updateSignupStatus(
	signupId: string,
	status: SignupStatus
) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	try {
		// First, get the signup to verify ownership through the event
		const signup = await prisma.signup.findUnique({
			where: { id: signupId },
			include: {
				event: {
					include: {
						host: true,
					},
				},
			},
		});

		if (!signup) {
			throw new Error('Signup not found');
		}

		// Verify that the current user is the host of this event
		if (signup.event.host.email !== user.email) {
			throw new Error('Unauthorized: You are not the host of this event');
		}

		// Prepare update data
		const updateData: {
			status: SignupStatus;
			performingAt?: Date | null;
		} = { status };

		// Set performingAt timestamp when marking as performing
		if (status === SignupStatus.PERFORMING) {
			updateData.performingAt = new Date();

			// Before marking this singer as performing, complete any current performer
			const currentPerformers = await prisma.signup.findMany({
				where: {
					eventId: signup.eventId,
					status: SignupStatus.PERFORMING,
					id: { not: signupId }, // Don't update the signup we're about to mark as performing
				},
			});

			// Update each current performer to complete
			for (const performer of currentPerformers) {
				await prisma.signup.update({
					where: { id: performer.id },
					data: {
						status: SignupStatus.COMPLETE,
					},
				});
			}
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
			// Get the current highest position among QUEUED signups only
			const maxPosition = await prisma.signup.findFirst({
				where: {
					eventId: signup.eventId,
					status: SignupStatus.QUEUED,
				},
				orderBy: {
					position: 'desc',
				},
				select: {
					position: true,
				},
			});

			// Assign the next position in the queue
			const nextPosition = (maxPosition?.position || 0) + 1;
			await prisma.signup.update({
				where: { id: signupId },
				data: { position: nextPosition },
			});
		}

		// If the status change affects queue position (performing, completing, or cancelling),
		// recalculate positions for remaining active signups
		if (
			status === SignupStatus.PERFORMING ||
			status === SignupStatus.COMPLETE ||
			status === SignupStatus.CANCELLED
		) {
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

export async function removeSignup(signupId: string) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	try {
		// First, get the signup to verify ownership through the event
		const signup = await prisma.signup.findUnique({
			where: { id: signupId },
			include: {
				event: {
					include: {
						host: true,
					},
				},
			},
		});

		if (!signup) {
			throw new Error('Signup not found');
		}

		// Verify that the current user is the host of this event
		if (signup.event.host.email !== user.email) {
			throw new Error('Unauthorized: You are not the host of this event');
		}

		// Remove the signup
		await prisma.signup.delete({
			where: { id: signupId },
		});

		// Recalculate positions for remaining active signups
		await recalculateEventQueuePositions(signup.eventId);

		// Revalidate the dashboard page
		revalidatePath(`/dashboard/${signup.event.slug}`);

		return { success: true };
	} catch (error) {
		console.error('Error removing signup:', error);
		throw error;
	}
}
