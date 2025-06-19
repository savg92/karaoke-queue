'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventWithQueue } from '@/app/actions/get-event-queue';
import { updateSignupStatus, removeSignup } from '@/app/actions/update-signup';
import { SignupStatus } from '@prisma/client';
import { toast } from 'sonner';

export function useEventQueue(eventSlug: string) {
	return useQuery({
		queryKey: ['event-queue', eventSlug],
		queryFn: () => getEventWithQueue(eventSlug),
		refetchInterval: 5000, // Refetch every 5 seconds for real-time-like updates
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['event-queue', eventSlug] });
			toast.success('Signup status updated successfully');
		},
		onError: (error) => {
			console.error('Error updating signup status:', error);
			toast.error('Failed to update signup status');
		},
	});
}

export function useRemoveSignup(eventSlug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (signupId: string) => removeSignup(signupId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['event-queue', eventSlug] });
			toast.success('Signup removed successfully');
		},
		onError: (error) => {
			console.error('Error removing signup:', error);
			toast.error('Failed to remove signup');
		},
	});
}
