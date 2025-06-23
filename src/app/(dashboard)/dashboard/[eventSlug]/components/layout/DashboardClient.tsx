'use client';

import { useDashboard } from '../../hooks/useDashboard';
import { DashboardLoadingState } from './DashboardLoadingState';
import { DashboardErrorState } from './DashboardErrorState';
import { Suspense, lazy } from 'react';

// Lazy load the heavy dashboard content
const DashboardContent = lazy(() =>
	import('./DashboardContent').then((module) => ({
		default: module.DashboardContent,
	}))
);

interface DashboardClientProps {
	eventSlug: string;
}

export function DashboardClient({ eventSlug }: DashboardClientProps) {
	const {
		data,
		allSignups,
		isLoading,
		isLoadingAttendees,
		error,
		handleUpdateStatus,
		handleRemoveSignup,
		handleReorderSignups,
		refetch,
		refetchAll,
	} = useDashboard(eventSlug);

	if (isLoading) {
		return <DashboardLoadingState />;
	}

	if (error) {
		return <DashboardErrorState onRetry={refetch} />;
	}

	if (!data) {
		return (
			<div className='container mx-auto py-8'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold mb-4'>Event Not Found</h1>
					<p className='text-muted-foreground'>
						The requested event could not be found.
					</p>
				</div>
			</div>
		);
	}

	const { event, signups } = data;

	return (
		<Suspense fallback={<DashboardLoadingState />}>
			<DashboardContent
				event={event}
				signups={signups}
				allSignups={allSignups}
				isLoadingAttendees={isLoadingAttendees}
				onUpdateStatus={handleUpdateStatus}
				onRemoveSignup={handleRemoveSignup}
				onReorderSignups={handleReorderSignups}
				onRefetchAll={refetchAll}
				eventSlug={eventSlug}
			/>
		</Suspense>
	);
}
