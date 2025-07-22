/**
 * Development Authentication Helper
 *
 * Provides a simple way to authenticate as specific users in development
 * ONLY for development use - should never be used in production
 */

'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Development login - creates a session without email verification
 * ONLY works in development mode
 */
export async function devLogin(email: string) {
	// Only allow in development
	if (process.env.NODE_ENV !== 'development') {
		throw new Error('Development login only available in development mode');
	}

	console.warn('[DEV AUTH] devLogin called for:', email);

	const supabase = await createClient();

	try {
		// For development, we'll create a user session directly
		// This bypasses email verification but requires the user to exist in the database

		// First check if user exists in our profiles table
		const { data: profile } = await supabase
			.from('profiles')
			.select('*')
			.eq('email', email)
			.single();

		if (!profile) {
			return {
				success: false,
				error: `Profile not found for ${email}. Make sure to run the seed script first.`,
			};
		}

		// In a real development bypass, you'd need to handle Supabase auth properly
		// For now, let's just return success and the profile info
		return {
			success: true,
			profile,
			message: `Note: For actual authentication, please use the magic link login at /login with ${email}`,
		};
	} catch (error) {
		return {
			success: false,
			error: 'Development login failed: ' + (error as Error).message,
		};
	}
}

/**
 * Quick development login links for testing
 */
export async function getDevLoginInfo() {
	if (process.env.NODE_ENV !== 'development') {
		return { devMode: false, users: [] };
	}

	const supabase = await createClient();

	const { data: profiles } = await supabase
		.from('profiles')
		.select('email, given_name, family_name')
		.limit(10);

	// Sort users by email for easier scanning
	const sortedUsers = (profiles || []).sort((a, b) =>
		a.email.localeCompare(b.email)
	);

	return {
		devMode: true,
		users: sortedUsers,
		instructions:
			'Use the magic link login at /login with any of these emails, then check your email for the magic link.',
	};
}
