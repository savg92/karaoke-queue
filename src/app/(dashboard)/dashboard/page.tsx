'use client';

import { getUserEvents } from '@/app/actions/get-user-events';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['userEvents'],
		queryFn: () => getUserEvents(),
	});

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className='h-6 w-3/4' />
								<Skeleton className='h-4 w-1/2' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-4 w-1/4 mb-4' />
								<div className='flex gap-2'>
									<Skeleton className='h-10 flex-1' />
									<Skeleton className='h-10 flex-1' />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			);
		}

		if (isError || !data) {
			return (
				<Card>
					<CardHeader className='text-center'>
						<CardTitle>Error</CardTitle>
						<CardDescription>
							Could not load your events. Please try again later.
						</CardDescription>
					</CardHeader>
				</Card>
			);
		}

		const { profile, eventCounts } = data;

		if (profile.events.length === 0) {
			return (
				<Card>
					<CardHeader className='text-center'>
						<CardTitle>No Events Yet</CardTitle>
						<CardDescription>
							Create your first karaoke event to get started!
						</CardDescription>
					</CardHeader>
					<CardContent className='text-center'>
						<Button asChild>
							<Link href='/dashboard/create-event'>
								<Plus className='mr-2 h-4 w-4' />
								Create Your First Event
							</Link>
						</Button>
					</CardContent>
				</Card>
			);
		}

		return (
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{profile.events.map((event) => (
					<Card
						key={event.id}
						className='cursor-pointer hover:shadow-md transition-shadow'
					>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Calendar className='h-4 w-4' />
								{event.name}
							</CardTitle>
							<CardDescription>
								{new Date(event.date).toLocaleDateString()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
								<Users className='h-4 w-4' />
								{eventCounts[event.id] || 0} signups
							</div>
							<div className='flex gap-2'>
								<Button
									asChild
									className='flex-1'
								>
									<Link href={`/dashboard/${event.slug}`}>Manage</Link>
								</Button>
								<Button
									asChild
									variant='outline'
									className='flex-1'
								>
									<Link href={`/event/${event.slug}`}>View Public</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	};

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
				{renderContent()}
			</div>
		</div>
	);
}
