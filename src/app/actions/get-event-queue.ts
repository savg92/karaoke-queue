'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SignupStatus } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import type { EventQueueData } from '@/app/(dashboard)/dashboard/[eventSlug]/types';

async function _getEventWithQueue(
	eventSlug: string,
	userEmail: string
): Promise<EventQueueData> {
	// Optimized query - only fetch what we need
	const event = await prisma.event.findUnique({
		where: { slug: eventSlug },
		select: {
			id: true,
			name: true,
			slug: true,
			date: true,
			description: true,
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

	// Fetch only active signups with optimized query
	const signups = await prisma.signup.findMany({
		where: {
			eventId: event.id,
			status: {
				in: [SignupStatus.QUEUED, SignupStatus.PERFORMING],
			},
		},
		orderBy: { position: 'asc' },
		select: {
			id: true,
			createdAt: true,
			singerName: true,
			songTitle: true,
			artist: true,
			performanceType: true,
			status: true,
			position: true,
			notes: true,
		},
	});

	return {
		event: {
			id: event.id,
			name: event.name,
			slug: event.slug,
			date: event.date,
			description: event.description,
		},
		signups,
	};
}

// Cache for 30 seconds since queue data changes frequently
const getCachedEventQueue = unstable_cache(
	_getEventWithQueue,
	['event-queue'],
	{
		revalidate: 30,
		tags: ['event-queue'],
	}
);

export async function getEventWithQueue(
	eventSlug: string
): Promise<EventQueueData> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	return getCachedEventQueue(eventSlug, user.email!);
}
