'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import type { QueueItem } from '@/app/(dashboard)/dashboard/[eventSlug]/types';

async function _getAllEventSignups(
	eventSlug: string,
	userEmail: string
): Promise<QueueItem[]> {
	// Fetch the event and verify ownership
	const event = await prisma.event.findUnique({
		where: { slug: eventSlug },
		select: {
			id: true,
			host: {
				select: {
					email: true,
				},
			},
		},
	});

	if (!event) {
		throw new Error('Event not found');
	}

	// Verify ownership
	if (event.host.email !== userEmail) {
		throw new Error('Unauthorized: You are not the host of this event');
	}

	// Fetch ALL signups for this event
	const signups = await prisma.signup.findMany({
		where: {
			eventId: event.id,
		},
		orderBy: { createdAt: 'asc' }, // Order by creation time for attendees view
	});

	return signups;
}

// Cache for 30 seconds since attendee data changes less frequently
const getCachedAllSignups = unstable_cache(
	_getAllEventSignups,
	['all-event-signups'],
	{
		revalidate: 30,
		tags: ['all-event-signups', 'event-queue'],
	}
);

export async function getAllEventSignups(
	eventSlug: string
): Promise<QueueItem[]> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	return getCachedAllSignups(eventSlug, user.email!);
}
