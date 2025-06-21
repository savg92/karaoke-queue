import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export interface SignupWithEvent {
	id: string;
	eventId: string;
	event: {
		slug: string;
		host: {
			email: string;
		};
	};
}

/**
 * Verifies that the current user is authorized to modify a signup
 * Returns the signup with event data if authorized
 */
export async function verifySignupAccess(
	signupId: string
): Promise<SignupWithEvent> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	// Get the signup to verify ownership through the event
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

	return signup;
}
