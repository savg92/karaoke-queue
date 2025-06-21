import { QueryClient } from '@tanstack/react-query';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../types';

export function updateStatusOptimistically(
	queryClient: QueryClient,
	eventSlug: string,
	signupId: string,
	status: SignupStatus
) {
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
		const finalSignups = recalculateQueuePositions(updatedSignups);

		return { ...data, signups: finalSignups };
	});

	// Optimistically update the attendees cache
	queryClient.setQueryData(['all-event-signups', eventSlug], (old: unknown) => {
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
	});
}

function recalculateQueuePositions(signups: QueueItem[]): QueueItem[] {
	const queuedSignups = signups
		.filter((s) => s && s.status === SignupStatus.QUEUED && s.createdAt)
		.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);

	return signups.map((signup) => {
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
}
