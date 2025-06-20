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

		// console.log('Reordering signups:', signupUpdates);
		// console.log('Event ID:', event.id);
		// console.log('Profile ID:', profile.id);

		// Update positions in a transaction
		// Use a two-step approach to avoid position conflicts during reordering
		await prisma.$transaction(async (tx) => {
			// Step 1: Set all positions to negative values to avoid conflicts
			for (let i = 0; i < signupUpdates.length; i++) {
				await tx.signup.update({
					where: {
						id: signupUpdates[i].id,
						eventId: event.id,
					},
					data: {
						position: -(i + 1), // Use negative positions temporarily
					},
				});
			}

			// Step 2: Set the final positions
			for (const update of signupUpdates) {
				await tx.signup.update({
					where: {
						id: update.id,
						eventId: event.id,
					},
					data: {
						position: update.position,
					},
				});
			}
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
