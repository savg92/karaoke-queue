'use client';

import { getUserEvents } from '@/app/actions/get-user-events';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardGridLoading } from '@/components/ui/CardGridLoading';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { useEventSorting } from './hooks/useEventSorting';
import { useShareEvent } from './hooks/useShareEvent';
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
	const { handleShareEvent, copyToClipboard } = useShareEvent();

	if (isLoading) return <CardGridLoading />;
	if (isError || !data)
		return (
			<ErrorState description='Could not load your events. Please try again later.' />
		);
	if (sortedEvents.length === 0) return <EmptyState />;

	return (
		<div className='container mx-auto py-8'>
			<div className='space-y-6'>
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
					<SortControls
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortDirection={sortDirection}
						setSortDirection={setSortDirection}
					/>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{sortedEvents.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								signupCount={data.eventCounts[event.id] || 0}
								onShare={handleShareEvent}
								onCopy={copyToClipboard}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
