import { QueryClient } from '@tanstack/react-query';
import type { QueueItem } from '../types';

export function updateEditOptimistically(
	queryClient: QueryClient,
	eventSlug: string,
	signupId: string,
	updates: { singerName?: string; songTitle?: string; artist?: string }
) {
	console.log('Applying optimistic updates for signup:', signupId, updates);

	// Optimistically update the queue cache
	queryClient.setQueryData(['event-queue', eventSlug], (old: unknown) => {
		if (!old || typeof old !== 'object') {
			console.warn('No event queue data found for optimistic update');
			return old;
		}
		const data = old as { signups: QueueItem[]; event: unknown };

		if (!data.signups || !Array.isArray(data.signups)) {
			console.warn('No signups array found in event queue data');
			return old;
		}

		const updatedSignups = data.signups.map((signup) => {
			if (!signup || !signup.id) return signup;

			if (signup.id === signupId) {
				const updated = { ...signup, ...updates };
				console.log('Updated signup in queue:', updated);
				return updated;
			}
			return signup;
		});

		return { ...data, signups: updatedSignups };
	});

	// Optimistically update the attendees cache
	queryClient.setQueryData(['all-event-signups', eventSlug], (old: unknown) => {
		if (!old || !Array.isArray(old)) {
			console.warn('No attendees data found for optimistic update');
			return old;
		}

		const updatedAttendees = old.map((signup: QueueItem) => {
			if (!signup || !signup.id) return signup;

			if (signup.id === signupId) {
				const updated = { ...signup, ...updates };
				console.log('Updated signup in attendees:', updated);
				return updated;
			}
			return signup;
		});

		console.log('Applied optimistic updates to both caches');
		return updatedAttendees;
	});
}
