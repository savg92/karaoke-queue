'use client';

import {
	useEventQueue,
	useUpdateSignupStatus,
	useRemoveSignup,
} from './hooks/useEventQueue';
import { useRealtimeQueue } from './hooks/useRealtimeQueue';
import { QueueTable } from './components/QueueTable';
import { QRCodeDialog } from './components/QRCodeDialog';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, RefreshCw } from 'lucide-react';
import { SignupStatus } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DashboardPageProps {
	params: Promise<{ eventSlug: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
	const [eventSlug, setEventSlug] = useState<string>('');

	useEffect(() => {
		params.then(({ eventSlug }) => setEventSlug(eventSlug));
	}, [params]);

	if (!eventSlug) {
		return <div>Loading...</div>;
	}

	return <DashboardClient eventSlug={eventSlug} />;
}

function DashboardClient({ eventSlug }: { eventSlug: string }) {
	const { data, isLoading, error, refetch } = useEventQueue(eventSlug);
	const updateStatusMutation = useUpdateSignupStatus(eventSlug);
	const removeSignupMutation = useRemoveSignup(eventSlug);

	// Enable real-time updates
	useRealtimeQueue(eventSlug);

	const handleUpdateStatus = (signupId: string, status: SignupStatus) => {
		updateStatusMutation.mutate({ signupId, status });
	};

	const handleRemoveSignup = (signupId: string) => {
		removeSignupMutation.mutate(signupId);
	};

	const handleShareEvent = () => {
		const eventUrl = `${window.location.origin}/event/${eventSlug}`;
		navigator.clipboard.writeText(eventUrl);
		toast.success('Event link copied to clipboard!');
	};

	const eventUrl = `${window.location.origin}/event/${eventSlug}`;

	if (isLoading) {
		return (
			<div className='container mx-auto py-8'>
				<div className='space-y-6'>
					<div className='flex justify-between items-center'>
						<div>
							<Skeleton className='h-8 w-64 mb-2' />
							<Skeleton className='h-4 w-48' />
						</div>
						<div className='flex gap-2'>
							<Skeleton className='h-10 w-32' />
							<Skeleton className='h-10 w-24' />
						</div>
					</div>

					<div className='grid gap-4 md:grid-cols-3'>
						<Skeleton className='h-24' />
						<Skeleton className='h-24' />
						<Skeleton className='h-24' />
					</div>

					<Skeleton className='h-64' />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container mx-auto py-8'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
					<p className='text-muted-foreground mb-4'>
						Failed to load event data. Please try again.
					</p>
					<Button onClick={() => refetch()}>
						<RefreshCw className='mr-2 h-4 w-4' />
						Retry
					</Button>
				</div>
			</div>
		);
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
	const queuedCount = signups.filter((s) => s.status === 'QUEUED').length;
	const performingSignups = signups.filter((s) => s.status === 'PERFORMING');
	const performingCount = performingSignups.length;
	const completedCount = signups.filter((s) => s.status === 'COMPLETE').length;

	// Get the current performer (first one in performing status)
	const currentPerformer = performingSignups[0] || null;

	return (
		<div className='container mx-auto py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex justify-between items-start'>
					<div>
						<h1 className='text-3xl font-bold'>{event.name}</h1>
						<p className='text-muted-foreground'>
							{new Date(event.date).toLocaleDateString()} - Host Dashboard
						</p>
					</div>
					<div className='flex gap-2'>
						<Button
							onClick={handleShareEvent}
							variant='outline'
						>
							<Share2 className='mr-2 h-4 w-4' />
							Share Event
						</Button>
						<QRCodeDialog
							eventUrl={eventUrl}
							eventName={event.name}
							eventDate={event.date}
						/>
					</div>
				</div>

				{/* Stats */}
				<div className='grid gap-4 md:grid-cols-3'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Queue</CardTitle>
							<Badge variant='secondary'>{queuedCount}</Badge>
						</CardHeader>
						<CardContent>
							<p className='text-2xl font-bold'>{queuedCount}</p>
							<p className='text-xs text-muted-foreground'>
								Waiting to perform
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Performing</CardTitle>
							<Badge variant='default'>{performingCount}</Badge>
						</CardHeader>
						<CardContent>
							{currentPerformer ? (
								<div className='space-y-2'>
									<p className='text-lg font-bold'>
										{currentPerformer.singerName}
									</p>
									<div className='space-y-1'>
										<p className='text-sm font-medium text-primary'>
											{currentPerformer.songTitle}
										</p>
										<p className='text-xs text-muted-foreground'>
											by {currentPerformer.artist}
										</p>
									</div>
									<p className='text-xs text-muted-foreground'>
										Currently on stage
									</p>
								</div>
							) : (
								<div>
									<p className='text-2xl font-bold'>{performingCount}</p>
									<p className='text-xs text-muted-foreground'>
										No one performing
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Completed</CardTitle>
							<Badge variant='outline'>{completedCount}</Badge>
						</CardHeader>
						<CardContent>
							<p className='text-2xl font-bold'>{completedCount}</p>
							<p className='text-xs text-muted-foreground'>
								Finished performances
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Queue Table */}
				<Card>
					<CardHeader>
						<CardTitle>Karaoke Queue</CardTitle>
						<CardDescription>
							Manage your karaoke queue - mark singers as performing, complete,
							or remove them from the queue.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<QueueTable
							signups={signups}
							onUpdateStatus={handleUpdateStatus}
							onRemoveSignup={handleRemoveSignup}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
