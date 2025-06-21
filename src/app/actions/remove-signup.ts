'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySignupAccess } from './utils/auth-verification';
import { recalculateEventQueuePositions } from './utils/queue-positions';

export async function removeSignup(signupId: string) {
	try {
		// Verify authorization and get signup data
		const signup = await verifySignupAccess(signupId);

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
