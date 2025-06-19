import { getUserEvents } from '@/app/actions/get-user-events';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Calendar, Users } from 'lucide-react';

// Enable page caching for better performance
export const revalidate = 60; // Revalidate every 60 seconds

export default async function DashboardPage() {
	const { profile, eventCounts } = await getUserEvents();

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

				{profile.events.length === 0 ? (
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
				) : (
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
				)}
			</div>
		</div>
	);
}
