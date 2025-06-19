'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Validation schema for creating an event
const createEventSchema = z.object({
	name: z
		.string()
		.min(1, 'Event name is required')
		.max(100, 'Event name must be less than 100 characters'),
	description: z.string().optional(),
	date: z.string().min(1, 'Event date is required'),
});

type CreateEventData = z.infer<typeof createEventSchema>;

/**
 * Generates a URL-friendly slug from the event name
 */
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.trim() // Remove leading/trailing spaces
		.substring(0, 50); // Limit length
}

/**
 * Ensures the slug is unique by appending a number if necessary
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
	let slug = baseSlug;
	let counter = 1;

	while (true) {
		const existingEvent = await prisma.event.findUnique({
			where: { slug },
		});

		if (!existingEvent) {
			return slug;
		}

		slug = `${baseSlug}-${counter}`;
		counter++;
	}
}

export async function createEvent(data: CreateEventData) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	try {
		// Validate the input data
		const validatedData = createEventSchema.parse(data);

		// Find or create the user's profile
		let profile = await prisma.profile.findUnique({
			where: { email: user.email! },
		});

		if (!profile) {
			profile = await prisma.profile.create({
				data: {
					email: user.email!,
					givenName: user.user_metadata?.given_name,
					familyName: user.user_metadata?.family_name,
					picture: user.user_metadata?.picture,
				},
			});
		}

		// Generate a unique slug for the event
		const baseSlug = generateSlug(validatedData.name);
		const uniqueSlug = await ensureUniqueSlug(baseSlug);

		// Parse the date string into a Date object
		const eventDate = new Date(validatedData.date);

		// Create the event
		const event = await prisma.event.create({
			data: {
				name: validatedData.name,
				description: validatedData.description,
				slug: uniqueSlug,
				date: eventDate,
				hostId: profile.id,
			},
		});

		return {
			success: true,
			event: {
				id: event.id,
				name: event.name,
				slug: event.slug,
				date: event.date,
				description: event.description,
			},
		};
	} catch (error) {
		console.error('Error creating event:', error);

		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: 'Invalid input data',
				details: error.errors,
			};
		}

		return {
			success: false,
			error: 'Failed to create event',
		};
	}
}
