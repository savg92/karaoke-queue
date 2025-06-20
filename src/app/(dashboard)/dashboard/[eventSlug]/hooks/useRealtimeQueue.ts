'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeQueue(eventSlug: string) {
	const queryClient = useQueryClient();

	useEffect(() => {
		const supabase = createClient();

		// Create a channel for real-time updates
		const channel = supabase
			.channel(`queue-${eventSlug}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'signups',
				},
				() => {
					// Invalidate both queue queries when signups change
					queryClient.invalidateQueries({
						queryKey: ['event-queue', eventSlug],
					});
					queryClient.invalidateQueries({
						queryKey: ['all-event-signups', eventSlug],
					});
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [eventSlug, queryClient]);
}
