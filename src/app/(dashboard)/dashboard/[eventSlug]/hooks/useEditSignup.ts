'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
			toast.success('Signup updated successfully');
		},
		onError: (error) => {
			console.error('Error editing signup:', error);
			toast.error('Failed to edit signup');
		},
	});
}
