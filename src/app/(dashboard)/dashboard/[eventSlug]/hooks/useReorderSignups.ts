'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reorderSignups } from '@/app/actions/reorder-signups';
import { toast } from 'sonner';
import type { QueueItem } from '../types';

export function useReorderSignups(eventSlug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (signups: QueueItem[]) => {
			const signupUpdates = signups.map((signup) => ({
				id: signup.id,
				position: signup.position,
			}));
			// console.log('Calling reorderSignups with:', signupUpdates);
			const result = await reorderSignups(eventSlug, signupUpdates);
			// console.log('Reorder result:', result);
			return result;
		},
		onMutate: async (newSignups) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ['event-queue', eventSlug] });

			// Snapshot the previous value
			const previousData = queryClient.getQueryData(['event-queue', eventSlug]);

			// Optimistically update the cache
			queryClient.setQueryData(['event-queue', eventSlug], (old: unknown) => {
				if (!old || typeof old !== 'object') return old;
				const data = old as { signups: QueueItem[]; event: unknown };
				return {
					...data,
					signups: newSignups,
				};
			});

			return { previousData };
		},
		onSuccess: (result) => {
			if (result.success) {
				toast.success('Queue order updated successfully');
			} else {
				toast.error(result.error || 'Failed to reorder signups');
			}
		},
		onError: (err, newSignups, context) => {
			console.error('Reorder error:', err);
			// Rollback on error
			if (context?.previousData) {
				queryClient.setQueryData(
					['event-queue', eventSlug],
					context.previousData
				);
			}
			toast.error('Failed to reorder signups');
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ['event-queue', eventSlug] });
			queryClient.invalidateQueries({
				queryKey: ['all-event-signups', eventSlug],
			});
		},
	});
}
