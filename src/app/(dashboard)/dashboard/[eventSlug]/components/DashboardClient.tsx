'use client';

import {
	useEventQueue,
	useUpdateSignupStatus,
	useRemoveSignup,
	useReorderSignups,
	useAllEventSignups,
} from '../hooks/useEventQueue';
import { useRealtimeQueue } from '../hooks/useRealtimeQueue';
import { QueueTable } from './QueueTable';
import { AttendeesTable } from './AttendeesTable';
import { AddAttendeeForm } from './AddAttendeeForm';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, RefreshCw, Music } from 'lucide-react';
import { SignupStatus } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeDialog } from './QRCodeDialog';
import { AutoYouTubeSearch } from './AutoYouTubeSearch';
import { toast } from 'sonner';
import type { QueueItem } from '../types';

interface DashboardClientProps {
	eventSlug: string;
}

export function DashboardClient({ eventSlug }: DashboardClientProps) {
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
	const queuedCount = signups.filter(
		(s) => s.status === SignupStatus.QUEUED
	).length;
	const completedCount = signups.filter(
		(s) => s.status === SignupStatus.COMPLETE
	).length;

	const performingSinger = signups.find(
		(s) => s.status === SignupStatus.PERFORMING
	);

	// Find the singer who is "up next" (QUEUED with position 1)
	const upNextSinger = signups.find(
		(s) => s.status === SignupStatus.QUEUED && s.position === 1
	);

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
							eventUrl={`${
								typeof window !== 'undefined' ? window.location.origin : ''
							}/event/${eventSlug}`}
							eventName={event.name}
							eventDate={new Date(event.date)}
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
							<CardTitle className='text-sm font-medium'>
								Now Performing
							</CardTitle>
							{performingSinger && (
								<Music className='h-4 w-4 text-muted-foreground' />
							)}
						</CardHeader>
						<CardContent>
							{performingSinger ? (
								<>
									<p className='text-2xl font-bold truncate'>
										{performingSinger.singerName}
									</p>
									<p className='text-xs text-muted-foreground truncate'>
										{performingSinger.songTitle} by {performingSinger.artist}
									</p>
								</>
							) : (
								<>
									<p className='text-2xl font-bold'>Stage is Empty</p>
									<p className='text-xs text-muted-foreground'>
										No one is currently singing
									</p>
								</>
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

				{/* Up Next Singer - YouTube Search */}
				{upNextSinger && (
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Music className='w-5 h-5' />
								Up Next: {upNextSinger.singerName}
							</CardTitle>
							<CardDescription>
								{upNextSinger.songTitle} by {upNextSinger.artist}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AutoYouTubeSearch
								songTitle={upNextSinger.songTitle}
								artist={upNextSinger.artist}
								signup={upNextSinger}
								onUpdateStatus={handleUpdateStatus}
								currentPerformer={performingSinger}
							/>
						</CardContent>
					</Card>
				)}

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
							onReorderSignups={handleReorderSignups}
						/>
					</CardContent>
				</Card>

				{/* All Attendees Table */}
				<Card>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<div>
								<CardTitle>All Event Attendees</CardTitle>
								<CardDescription>
									Complete list of everyone who has signed up for your event,
									including completed and cancelled signups.
								</CardDescription>
							</div>
							<AddAttendeeForm
								eventId={event.id}
								onSuccess={() => {
									// Refetch both queries after successful addition
									refetch();
									refetchAttendees();
								}}
							/>
						</div>
					</CardHeader>
					<CardContent>
						{isLoadingAttendees ? (
							<div className='space-y-3'>
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className='h-12 bg-muted rounded animate-pulse'
									/>
								))}
							</div>
						) : allSignups ? (
							<AttendeesTable
								signups={allSignups}
								onUpdateStatus={handleUpdateStatus}
								onRemoveSignup={handleRemoveSignup}
							/>
						) : (
							<div className='text-center py-4'>
								<p className='text-muted-foreground'>
									No attendees data available.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
