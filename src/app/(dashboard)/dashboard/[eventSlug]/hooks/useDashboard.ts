import { toast } from 'sonner';
import { useEventQueue, useAllEventSignups } from './useEventQueries';
import { useUpdateSignupStatus } from './useUpdateSignupStatus';
import { useRemoveSignup } from './useRemoveSignup';
import { useReorderSignups } from './useReorderSignups';
import { useRealtimeQueue, useRealtimeDebugger } from './useRealtimeQueue';
import type { QueueItem, SignupStatus } from '../types';

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

	// Enable real-time updates and debugging only after we have event data
	// This prevents the error where realtime tries to access query data before it's loaded
	const hasEventData = Boolean(data?.event?.id);
	useRealtimeQueue(eventSlug, hasEventData);
	useRealtimeDebugger(eventSlug);

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
