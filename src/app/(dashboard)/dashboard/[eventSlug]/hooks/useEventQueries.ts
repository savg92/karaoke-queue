'use client';

import { useQuery } from '@tanstack/react-query';
import { getEventWithQueue } from '@/app/actions/get-event-queue';
import { getAllEventSignups } from '@/app/actions/get-all-signups';

export function useEventQueue(eventSlug: string) {
	return useQuery({
		queryKey: ['event-queue', eventSlug],
		queryFn: () => getEventWithQueue(eventSlug),
		// Optimized for better UX
		staleTime: 30 * 1000, // Consider data stale after 30 seconds
		gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
		retry: (failureCount, error) => {
			// Don't retry auth errors
			if (error instanceof Error && error.message.includes('Unauthorized')) {
				return false;
			}
			// Retry up to 2 times for other errors
			return failureCount < 2;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		// Show cached data while refetching in background
		refetchOnWindowFocus: false,
		refetchOnMount: true,
	});
}

export function useAllEventSignups(eventSlug: string) {
	return useQuery({
		queryKey: ['all-event-signups', eventSlug],
		queryFn: () => getAllEventSignups(eventSlug),
		// Optimized for better UX
		staleTime: 30 * 1000, // Consider data stale after 30 seconds
		gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
		retry: (failureCount, error) => {
			// Don't retry auth errors
			if (error instanceof Error && error.message.includes('Unauthorized')) {
				return false;
			}
			// Retry up to 2 times for other errors
			return failureCount < 2;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		// Show cached data while refetching in background
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		// Load this data slightly later to prioritize the main queue
		enabled: true,
	});
}
