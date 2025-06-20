'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventWithQueue } from '@/app/actions/get-event-queue';
import { getAllEventSignups } from '@/app/actions/get-all-signups';
import { updateSignupStatus, removeSignup } from '@/app/actions/update-signup';
import { reorderSignups } from '@/app/actions/reorder-signups';
import { SignupStatus } from '@prisma/client';
import { toast } from 'sonner';
import type { QueueItem } from '../types';

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

			// Optimistically update the queue cache
			queryClient.setQueryData(['event-queue', eventSlug], (old: unknown) => {
				if (!old || typeof old !== 'object') return old;
				const data = old as { signups: QueueItem[]; event: unknown };

				// Safety check - ensure we have signups array
				if (!data.signups || !Array.isArray(data.signups)) return old;

				const updatedSignups = data.signups.map((signup) => {
					// Safety check - ensure signup has required fields
					if (!signup || !signup.id || !signup.status) return signup;

					if (signup.id === signupId) {
						return { ...signup, status };
					}
					// If marking someone as PERFORMING, complete any current performers
					if (
						status === SignupStatus.PERFORMING &&
						signup.status === SignupStatus.PERFORMING
					) {
						return { ...signup, status: SignupStatus.COMPLETE, position: 0 };
					}
					return signup;
				});

				// Recalculate positions for QUEUED signups
				const queuedSignups = updatedSignups
					.filter((s) => s && s.status === SignupStatus.QUEUED && s.createdAt)
					.sort(
						(a, b) =>
							new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);

				const finalSignups = updatedSignups.map((signup) => {
					if (!signup) return signup;

					if (signup.status === SignupStatus.QUEUED) {
						const queueIndex = queuedSignups.findIndex(
							(q) => q && q.id === signup.id
						);
						return {
							...signup,
							position: queueIndex >= 0 ? queueIndex + 1 : 0,
						};
					} else {
						return { ...signup, position: 0 };
					}
				});

				return { ...data, signups: finalSignups };
			});

			// Optimistically update the attendees cache
			queryClient.setQueryData(
				['all-event-signups', eventSlug],
				(old: unknown) => {
					if (!old || !Array.isArray(old)) return old;
					return old.map((signup: QueueItem) => {
						// Safety check - ensure signup has required fields
						if (!signup || !signup.id || !signup.status) return signup;

						if (signup.id === signupId) {
							return { ...signup, status };
						}
						// If marking someone as PERFORMING, complete any current performers
						if (
							status === SignupStatus.PERFORMING &&
							signup.status === SignupStatus.PERFORMING
						) {
							return { ...signup, status: SignupStatus.COMPLETE, position: 0 };
						}
						return signup;
					});
				}
			);

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

export function useRemoveSignup(eventSlug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (signupId: string) => removeSignup(signupId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['event-queue', eventSlug] });
			queryClient.invalidateQueries({
				queryKey: ['all-event-signups', eventSlug],
			});
			toast.success('Signup removed successfully');
		},
		onError: (error) => {
			console.error('Error removing signup:', error);
			toast.error('Failed to remove signup');
		},
	});
}

export function useReorderSignups(eventSlug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (signups: QueueItem[]) => {
			const signupUpdates = signups.map((signup) => ({
				id: signup.id,
				position: signup.position,
			}));
			console.log('Calling reorderSignups with:', signupUpdates);
			const result = await reorderSignups(eventSlug, signupUpdates);
			console.log('Reorder result:', result);
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['event-queue', eventSlug] });
			queryClient.invalidateQueries({
				queryKey: ['all-event-signups', eventSlug],
			});
		},
		onError: (error) => {
			console.error('Error editing signup:', error);
		},
	});
}
