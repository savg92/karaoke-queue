/**
 * Debug utility to test real-time subscription functionality
 * Add this to your dashboard component temporarily to debug real-time issues
 */

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeDebug(eventSlug: string) {
	useEffect(() => {
		if (process.env.NODE_ENV !== 'development') return;

		const supabase = createClient();

		console.log(`🔍 Setting up real-time debug for event: ${eventSlug}`);

		const channel = supabase
			.channel(`debug-${eventSlug}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'signups',
				},
				(payload) => {
					console.log('🚀 Real-time event received:', {
						eventType: payload.eventType,
						table: payload.table,
						schema: payload.schema,
						new: payload.new,
						old: payload.old,
						timestamp: new Date().toISOString(),
					});

					// Check if this signup belongs to the current event
					if (payload.new && 'eventId' in payload.new) {
						console.log(
							`📋 Signup belongs to event ID: ${payload.new.eventId}`
						);
					}
				}
			)
			.subscribe((status) => {
				console.log(`🔗 Subscription status: ${status}`);
			});

		// Test the connection
		setTimeout(() => {
			console.log('🧪 Testing real-time connection...');
			supabase.channel('test').subscribe();
		}, 1000);

		return () => {
			console.log(`🧹 Cleaning up real-time debug for event: ${eventSlug}`);
			supabase.removeChannel(channel);
		};
	}, [eventSlug]);
}

// Usage: Add this to your dashboard component
// useRealtimeDebug(eventSlug);
