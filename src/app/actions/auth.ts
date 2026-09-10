'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/get-base-url';
import { redirect } from 'next/navigation';

const emailSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const passwordLoginSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address.' }),
	password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const signUpSchema = z
	.object({
		email: z.string().email({ message: 'Please enter a valid email address.' }),
		password: z.string().min(6, 'Password must be at least 6 characters.'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

/**
 * Sign in with email + password
 */
export async function signInWithPassword(
	email: string,
	password: string
): Promise<{ success: boolean; error?: string }> {
	const validation = passwordLoginSchema.safeParse({ email, password });
	if (!validation.success) {
		return { success: false, error: validation.error.issues[0]?.message };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		return { success: false, error: error.message };
	}

	return { success: true };
}

/**
 * Sign up with email + password
 */
export async function signUpWithPassword(
	email: string,
	password: string,
	confirmPassword: string
): Promise<{ success: boolean; error?: string }> {
	const validation = signUpSchema.safeParse({ email, password, confirmPassword });
	if (!validation.success) {
		return { success: false, error: validation.error.issues[0]?.message };
	}

	const supabase = await createClient();
	const origin = await getBaseUrl();

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
		},
	});

	if (error) {
		return { success: false, error: error.message };
	}

	return { success: true };
}

/**
 * Initiate Google OAuth sign-in (returns redirect URL)
 */
export async function signInWithGoogle(): Promise<{
	success: boolean;
	url?: string;
	error?: string;
}> {
	const supabase = await createClient();
	const origin = await getBaseUrl();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${origin}/auth/callback`,
		},
	});

	if (error) {
		return { success: false, error: error.message };
	}

	return { success: true, url: data.url };
}

/**
 * Send password reset email
 */
export async function resetPassword(
	email: string
): Promise<{ success: boolean; error?: string }> {
	const validation = emailSchema.safeParse({ email });
	if (!validation.success) {
		return { success: false, error: validation.error.issues[0]?.message };
	}

	const supabase = await createClient();
	const origin = await getBaseUrl();

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/callback?next=/change-password`,
	});

	if (error) {
		return { success: false, error: error.message };
	}

	return { success: true };
}

/**
 * Update password (for authenticated users)
 * Verifies current password first by re-authenticating.
 */
export async function updatePassword(
	newPassword: string,
	currentPassword?: string
): Promise<{ success: boolean; error?: string }> {
	if (newPassword.length < 6) {
		return { success: false, error: 'New password must be at least 6 characters.' };
	}

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return { success: false, error: 'You must be logged in.' };
	}

	// If current password provided, verify it first
	if (currentPassword) {
		const { error: verifyError } = await supabase.auth.signInWithPassword({
			email: user.email!,
			password: currentPassword,
		});

		if (verifyError) {
			return { success: false, error: 'Current password is incorrect.' };
		}
	}

	const { error } = await supabase.auth.updateUser({ password: newPassword });

	if (error) {
		return { success: false, error: error.message };
	}

	return { success: true };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect('/login');
}
