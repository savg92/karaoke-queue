'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeSignup } from '@/app/actions/remove-signup';
import { toast } from 'sonner';

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
