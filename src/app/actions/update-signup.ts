'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SignupStatus } from '@prisma/client';

/**
 * Recalculates queue positions for all active signups in an event.
 * Active signups are those with QUEUED or PERFORMING status.
 */
async function recalculateEventQueuePositions(eventId: string) {
	// Get all active signups for the event, ordered by creation time
	const activeSignups = await prisma.signup.findMany({
		where: {
			eventId,
			status: {
				in: [SignupStatus.QUEUED, SignupStatus.PERFORMING],
			},
		},
		orderBy: {
			createdAt: 'asc', // Maintain fairness by creation order
		},
	});

	// Update each signup with new sequential positions
	const updatePromises = activeSignups.map((signup, index) =>
		prisma.signup.update({
			where: { id: signup.id },
			data: { position: index + 1 },
		})
	);

	await Promise.all(updatePromises);
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

		// Update the signup status
		await prisma.signup.update({
			where: { id: signupId },
			data: { status },
		});

		// If the status change affects queue position (completing or cancelling),
		// recalculate positions for remaining active signups
		if (status === SignupStatus.COMPLETE || status === SignupStatus.CANCELLED) {
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
