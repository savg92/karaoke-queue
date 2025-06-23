'use client';

import { getUserEvents } from '@/app/actions/get-user-events';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardGridLoading } from '@/components/ui/CardGridLoading';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { useEventSorting } from './hooks/useEventSorting';
import { SortControls } from './components/SortControls';
import { EventCard } from './components/EventCard';
import { EmptyState } from './components/EmptyState';

export default function DashboardPage() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['userEvents'],
		queryFn: () => getUserEvents(),
	});

	const { sortBy, setSortBy, sortDirection, setSortDirection, sortedEvents } =
		useEventSorting(data);

	// Render the error state only if there's an error and we're not loading
	if (isError && !isLoading) {
		return (
			<ErrorState description='Could not load your events. Please try again later.' />
		);
	}

	// Show empty state only when we have data but no events
	const showEmptyState = !isLoading && data && sortedEvents.length === 0;

	if (showEmptyState) {
		return <EmptyState />;
	}

	return (
		<div className='container mx-auto py-8'>
			<div className='space-y-6'>
				{/* Header - always visible */}
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-3xl font-bold'>Dashboard</h1>
						<p className='text-muted-foreground'>
							Welcome back! Manage your karaoke events.
						</p>
					</div>
					<Button asChild>
						<Link href='/dashboard/create-event'>
							<Plus className='mr-2 h-4 w-4' />
							Create Event
						</Link>
					</Button>
				</div>

				<div className='space-y-4'>
					{/* Sort Controls - always visible but disabled during loading */}
					<SortControls
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortDirection={sortDirection}
						setSortDirection={setSortDirection}
						disabled={isLoading}
					/>

					{/* Content Area */}
					{isLoading ? (
						<CardGridLoading count={6} />
					) : (
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
							{sortedEvents.map((event) => (
								<EventCard
									key={event.id}
									event={event}
									signupCount={data?.eventCounts[event.id] || 0}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
