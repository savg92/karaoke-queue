'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeQueue(eventSlug: string, hasEventData?: boolean) {
	const queryClient = useQueryClient();

	useEffect(() => {
		// Don't start realtime subscription if we don't have event data yet
		if (!hasEventData) {
			console.log(
				`Waiting for event data before starting realtime subscription for ${eventSlug}`
			);
			return;
		}

		const supabase = createClient();

		// First, get the event ID to filter real-time updates properly
		const getEventAndSubscribe = async () => {
			try {
				// Get event data to filter real-time updates
				const eventData = queryClient.getQueryData([
					'event-queue',
					eventSlug,
				]) as { event?: { id: string } } | undefined;

				// More robust check for event ID
				const eventId = eventData?.event?.id;

				if (!eventId) {
					console.warn(
						`No event ID found for real-time subscription for slug: ${eventSlug}. Query data:`,
						eventData
					);
					// Retry after a short delay
					setTimeout(getEventAndSubscribe, 1000);
					return null;
				}

				console.log(
					`Setting up real-time subscription for event ${eventId} (slug: ${eventSlug})`
				);

				// Create a channel for real-time updates with event-specific filtering
				const channel = supabase
					.channel(`queue-${eventSlug}-${eventId}`)
					.on(
						'postgres_changes',
						{
							event: '*',
							schema: 'public',
							table: 'signups',
							filter: `eventId=eq.${eventId}`, // Only listen to changes for this event
						},
						(payload) => {
							console.log(
								`Real-time update for event ${eventSlug}:`,
								payload.eventType,
								payload
							);

							// Force immediate cache invalidation and refetch
							const invalidateAndRefetch = async () => {
								console.log(
									'Invalidating and refetching queries for',
									eventSlug
								);

								// Invalidate first
								await Promise.all([
									queryClient.invalidateQueries({
										queryKey: ['event-queue', eventSlug],
									}),
									queryClient.invalidateQueries({
										queryKey: ['all-event-signups', eventSlug],
									}),
								]);

								// Then force refetch to ensure immediate update
								await Promise.all([
									queryClient.refetchQueries({
										queryKey: ['event-queue', eventSlug],
									}),
									queryClient.refetchQueries({
										queryKey: ['all-event-signups', eventSlug],
									}),
								]);
							};

							invalidateAndRefetch().catch((error) => {
								console.error('Error in real-time invalidation:', error);
							});
						}
					)
					.subscribe((status) => {
						console.log(
							`Real-time subscription status for ${eventSlug}:`,
							status
						);
					});

				// Store channel for cleanup
				return channel;
			} catch (error) {
				console.error('Error setting up real-time subscription:', error);
				return null;
			}
		};

		const channelPromise = getEventAndSubscribe();

		return () => {
			channelPromise
				.then((channel) => {
					if (channel) {
						console.log(`Cleaning up real-time subscription for ${eventSlug}`);
						supabase.removeChannel(channel);
					}
				})
				.catch((error) => {
					console.error('Error during cleanup:', error);
				});
		};
	}, [eventSlug, queryClient, hasEventData]);
}

// Add a separate hook for debugging real-time issues
export function useRealtimeDebugger(eventSlug: string) {
	const queryClient = useQueryClient();

	useEffect(() => {
		// Log when queries are invalidated
		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			if (
				event.type === 'updated' &&
				event.query.queryKey.includes(eventSlug)
			) {
				console.log(
					'Query cache updated:',
					event.query.queryKey,
					event.query.state
				);
			}
		});

		return unsubscribe;
	}, [eventSlug, queryClient]);
}
