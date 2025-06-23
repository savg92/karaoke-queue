'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateEditOptimistically } from '../utils/edit-optimistic-updates';

export function useEditSignup(eventSlug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			signupId,
			formData,
		}: {
			signupId: string;
			formData: FormData;
		}) => {
			const { editSignup } = await import('@/app/actions/edit-signup');
			return editSignup(signupId, formData);
		},
		onMutate: async ({ signupId, formData }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ['event-queue', eventSlug] });
			await queryClient.cancelQueries({
				queryKey: ['all-event-signups', eventSlug],
			});

			// Snapshot the previous values
			const previousQueue = queryClient.getQueryData([
				'event-queue',
				eventSlug,
			]);
			const previousAttendees = queryClient.getQueryData([
				'all-event-signups',
				eventSlug,
			]);

			// Extract form data
			const updates = {
				singerName: formData.get('singerName') as string,
				songTitle: formData.get('songTitle') as string,
				artist: formData.get('artist') as string,
			};

			// Optimistically update the cache
			updateEditOptimistically(queryClient, eventSlug, signupId, updates);

			// Return context for rollback
			return { previousQueue, previousAttendees };
		},
		onError: (error, variables, context) => {
			// Rollback on error
			if (context?.previousQueue) {
				queryClient.setQueryData(
					['event-queue', eventSlug],
					context.previousQueue
				);
			}
			if (context?.previousAttendees) {
				queryClient.setQueryData(
					['all-event-signups', eventSlug],
					context.previousAttendees
				);
			}

			console.error('Error editing signup:', error);
			toast.error('Failed to edit signup');
		},
		onSuccess: async (result) => {
			console.log('Edit signup successful:', result);

			// Force immediate invalidation and refetch
			try {
				console.log('Invalidating and refetching queries after edit...');

				// Invalidate all related queries immediately
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: ['event-queue', eventSlug],
						exact: false,
					}),
					queryClient.invalidateQueries({
						queryKey: ['all-event-signups', eventSlug],
						exact: false,
					}),
				]);

				// Force refetch to ensure immediate UI update
				await Promise.all([
					queryClient.refetchQueries({
						queryKey: ['event-queue', eventSlug],
					}),
					queryClient.refetchQueries({
						queryKey: ['all-event-signups', eventSlug],
					}),
				]);

				console.log('Queries invalidated and refetched successfully');
				toast.success('Signup updated successfully');
			} catch (error) {
				console.error('Error during post-success invalidation:', error);
				toast.success('Signup updated successfully');
			}
		},
	});
}
