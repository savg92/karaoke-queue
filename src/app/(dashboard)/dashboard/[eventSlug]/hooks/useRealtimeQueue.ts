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
					// Invalidate the queue query when signups change
					queryClient.invalidateQueries({
						queryKey: ['event-queue', eventSlug],
					});
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [eventSlug, queryClient]);
}
