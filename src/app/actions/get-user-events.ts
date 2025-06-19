'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

async function _getUserEvents(userEmail: string) {
	// Optimized query - fetch events without expensive joins
	const profile = await prisma.profile.findUnique({
		where: { email: userEmail },
		include: {
			events: {
				orderBy: {
					date: 'desc',
				},
				take: 10, // Limit for performance
			},
		},
	});

	if (!profile) {
		return null;
	}

	// Get signup counts efficiently if events exist
	if (profile.events.length === 0) {
		return {
			profile,
			eventCounts: {},
		};
	}

	const eventIds = profile.events.map(event => event.id);
	const signupCounts = await prisma.signup.groupBy({
		by: ['eventId'],
		where: {
			eventId: {
				in: eventIds,
			},
		},
		_count: {
			id: true,
		},
	});

	// Create lookup map for counts
	const eventCounts = signupCounts.reduce((acc, item) => {
		acc[item.eventId] = item._count.id;
		return acc;
	}, {} as Record<string, number>);

	return {
		profile,
		eventCounts,
	};
}

// Cache the function for 60 seconds
const getCachedUserEvents = unstable_cache(
	_getUserEvents,
	['user-events'],
	{
		revalidate: 60,
		tags: ['user-events'],
	}
);

export async function getUserEvents() {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	const result = await getCachedUserEvents(user.email!);
	
	if (!result) {
		redirect('/login');
	}

	return result;
}
