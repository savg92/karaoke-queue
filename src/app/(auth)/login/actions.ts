'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { type FormState } from '@/app/(auth)/login/definitions';

// Define the schema for the login form using Zod.
// This ensures that the email is a valid email address before we process it.
const loginSchema = z.object({
	email: z.string().email({
		message: 'Please enter a valid email address.',
	}),
});

// This is the server action that handles the login process.
export async function login(
	prevState: FormState,
	formData: FormData
): Promise<FormState> {
	// Create a Supabase client that can be used in server actions.
	const supabase = await createClient();

	// Validate the form data against the schema.
	const validation = loginSchema.safeParse({
		email: formData.get('email'),
	});

	// If validation fails, return the error messages.
	if (!validation.success) {
		return {
			message: 'Validation failed.',
			errors: validation.error.flatten().fieldErrors,
		};
	}

	// Get the origin of the request from the headers.
	// This is needed to construct the redirect URL for the magic link.
	const origin = (await headers()).get('origin');

	// Call the Supabase `signInWithOtp` method to send a magic link.
	// The user will be redirected to the `/auth/callback` route after clicking the link.
	const { error } = await supabase.auth.signInWithOtp({
		email: validation.data.email,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
		},
	});

	// If there was an error sending the magic link, return an error message.
	if (error) {
		return {
			message: 'Database Error: Could not send magic link.',
			errors: {
				_form: ['Could not send magic link. Please try again.'],
			},
		};
	}

	// If the magic link was sent successfully, return a success message.
	return {
		message: 'Check your email for a magic link to sign in.',
		errors: {},
	};
}

// New simplified login function for React Hook Form
export async function loginWithEmail(
	email: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	// Validate email
	const loginValidation = loginSchema.safeParse({ email });
	if (!loginValidation.success) {
		return {
			success: false,
			error: loginValidation.error.issues[0]?.message || 'Invalid email',
		};
	}

	try {
		const headersList = await headers();
		const origin = headersList.get('origin') || 'http://localhost:3000';

		const { error } = await supabase.auth.signInWithOtp({
			email: email,
			options: {
				emailRedirectTo: `${origin}/auth/callback`,
			},
		});

		if (error) {
			console.error('Supabase auth error:', error);
			return {
				success: false,
				error: 'Failed to send magic link. Please try again.',
			};
		}

		return { success: true };
	} catch (error) {
		console.error('Login error:', error);
		return {
			success: false,
			error: 'An unexpected error occurred',
		};
	}
}
