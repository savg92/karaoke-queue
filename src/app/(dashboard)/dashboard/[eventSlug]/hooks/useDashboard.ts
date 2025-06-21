import { toast } from 'sonner';
import { SignupStatus } from '@prisma/client';
import { useEventQueue, useAllEventSignups } from './useEventQueries';
import { useUpdateSignupStatus } from './useUpdateSignupStatus';
import { useRemoveSignup } from './useRemoveSignup';
import { useReorderSignups } from './useReorderSignups';
import { useRealtimeQueue } from './useRealtimeQueue';
import type { QueueItem } from '../types';

export function useDashboard(eventSlug: string) {
	const { data, isLoading, error, refetch } = useEventQueue(eventSlug);
	const {
		data: allSignups,
		isLoading: isLoadingAttendees,
		refetch: refetchAttendees,
	} = useAllEventSignups(eventSlug);

	const updateStatusMutation = useUpdateSignupStatus(eventSlug);
	const removeSignupMutation = useRemoveSignup(eventSlug);
	const reorderSignupsMutation = useReorderSignups(eventSlug);

	// Enable real-time updates
	useRealtimeQueue(eventSlug);

	const handleUpdateStatus = (signupId: string, status: SignupStatus) => {
		updateStatusMutation.mutate({ signupId, status });
	};

	const handleRemoveSignup = (signupId: string) => {
		removeSignupMutation.mutate(signupId);
	};

	const handleReorderSignups = (reorderedSignups: QueueItem[]) => {
		reorderSignupsMutation.mutate(reorderedSignups);
	};

	const handleShareEvent = () => {
		const eventUrl = `${window.location.origin}/event/${eventSlug}`;
		navigator.clipboard.writeText(eventUrl);
		toast.success('Event link copied to clipboard!');
	};

	const refetchAll = () => {
		refetch();
		refetchAttendees();
	};

	return {
		data,
		allSignups,
		isLoading,
		isLoadingAttendees,
		error,
		handleUpdateStatus,
		handleRemoveSignup,
		handleReorderSignups,
		handleShareEvent,
		refetch,
		refetchAll,
	};
}
