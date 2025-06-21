'use client';

import { useQuery } from '@tanstack/react-query';
import { getEventWithQueue } from '@/app/actions/get-event-queue';
import { getAllEventSignups } from '@/app/actions/get-all-signups';

export function useEventQueue(eventSlug: string) {
	return useQuery({
		queryKey: ['event-queue', eventSlug],
		queryFn: () => getEventWithQueue(eventSlug),
		refetchInterval: 5000, // Refetch every 5 seconds for real-time-like updates
	});
}

export function useAllEventSignups(eventSlug: string) {
	return useQuery({
		queryKey: ['all-event-signups', eventSlug],
		queryFn: () => getAllEventSignups(eventSlug),
		refetchInterval: 5000, // Refetch every 5 seconds
	});
}
