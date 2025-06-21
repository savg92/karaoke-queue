'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSignupStatus } from '@/app/actions/update-signup-status';
import { SignupStatus } from '@prisma/client';
import { toast } from 'sonner';
import { updateStatusOptimistically } from '../utils/optimistic-updates';

export function useUpdateSignupStatus(eventSlug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			signupId,
			status,
		}: {
			signupId: string;
			status: SignupStatus;
		}) => updateSignupStatus(signupId, status),
		onMutate: async ({ signupId, status }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ['event-queue', eventSlug] });
			await queryClient.cancelQueries({
				queryKey: ['all-event-signups', eventSlug],
			});

			// Snapshot the previous values
			const previousQueueData = queryClient.getQueryData([
				'event-queue',
				eventSlug,
			]);
			const previousAttendeesData = queryClient.getQueryData([
				'all-event-signups',
				eventSlug,
			]);

			// Apply optimistic updates
			updateStatusOptimistically(queryClient, eventSlug, signupId, status);

			return { previousQueueData, previousAttendeesData };
		},
		onError: (err, variables, context) => {
			// Rollback on error
			if (context) {
				queryClient.setQueryData(
					['event-queue', eventSlug],
					context.previousQueueData
				);
				queryClient.setQueryData(
					['all-event-signups', eventSlug],
					context.previousAttendeesData
				);
			}
			console.error('Error updating signup status:', err);
			toast.error('Failed to update signup status');
		},
		onSuccess: () => {
			// Invalidate to ensure we have the latest server data
			queryClient.invalidateQueries({ queryKey: ['event-queue', eventSlug] });
			queryClient.invalidateQueries({
				queryKey: ['all-event-signups', eventSlug],
			});
			toast.success('Signup status updated successfully');
		},
	});
}
