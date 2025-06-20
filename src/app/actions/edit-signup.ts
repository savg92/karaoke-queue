'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema for editing signup details
const editSignupSchema = z.object({
	singerName: z
		.string()
		.min(1, 'Singer name is required')
		.max(200, 'Singer name must be less than 200 characters')
		.trim(),
	songTitle: z
		.string()
		.min(1, 'Song title is required')
		.max(200, 'Song title must be less than 200 characters')
		.trim(),
	artist: z
		.string()
		.min(1, 'Artist name is required')
		.max(200, 'Artist name must be less than 200 characters')
		.trim(),
});

export type EditSignupResult = {
	success: boolean;
	message: string;
	errors?: {
		singerName?: string[];
		songTitle?: string[];
		artist?: string[];
		_form?: string[];
	};
};

/**
 * Server action to edit signup details (singer name, song title, artist)
 */
export async function editSignup(
	signupId: string,
	formData: FormData
): Promise<EditSignupResult> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	try {
		// Extract and validate form data
		const rawData = {
			singerName: formData.get('singerName'),
			songTitle: formData.get('songTitle'),
			artist: formData.get('artist'),
		};

		const validationResult = editSignupSchema.safeParse(rawData);

		if (!validationResult.success) {
			const errors = validationResult.error.flatten().fieldErrors;
			return {
				success: false,
				message: 'Please fix the validation errors below.',
				errors,
			};
		}

		const validatedData = validationResult.data;

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
			return {
				success: false,
				message: 'Signup not found.',
			};
		}

		// Verify that the current user is the host of this event
		if (signup.event.host.email !== user.email) {
			return {
				success: false,
				message: 'Unauthorized: You are not the host of this event.',
			};
		}

		// Update the signup details
		await prisma.signup.update({
			where: { id: signupId },
			data: {
				singerName: validatedData.singerName,
				songTitle: validatedData.songTitle,
				artist: validatedData.artist,
			},
		});

		// Revalidate the dashboard page
		revalidatePath(`/dashboard/${signup.event.slug}`);

		return {
			success: true,
			message: 'Signup details updated successfully.',
		};
	} catch (error) {
		console.error('Error editing signup:', error);
		return {
			success: false,
			message: 'An unexpected error occurred. Please try again later.',
		};
	}
}
