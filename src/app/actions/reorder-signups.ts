'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function reorderSignups(
	eventSlug: string,
	signupUpdates: { id: string; position: number }[]
) {
	try {
		// Verify the user is authenticated and owns this event
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Find the user's profile
		const profile = await prisma.profile.findUnique({
			where: { email: user.email! },
		});

		if (!profile) {
			throw new Error('User profile not found');
		}

		// Verify event ownership using profile ID
		const event = await prisma.event.findFirst({
			where: {
				slug: eventSlug,
				hostId: profile.id,
			},
		});

		if (!event) {
			throw new Error('Event not found or access denied');
		}

		// Optimize reordering with batch operations
		await prisma.$transaction(async (tx) => {
			// Create all update operations and execute them in parallel
			const updateOperations = signupUpdates.map((update) =>
				tx.signup.update({
					where: {
						id: update.id,
						eventId: event.id,
					},
					data: {
						position: update.position,
					},
				})
			);

			// Execute all updates in parallel within the transaction
			await Promise.all(updateOperations);
		});

		console.log('Successfully updated signup positions');

		// Revalidate the dashboard page
		revalidatePath(`/dashboard/${eventSlug}`);

		return { success: true };
	} catch (error) {
		console.error('Error reordering signups:', error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to reorder signups',
		};
	}
}
