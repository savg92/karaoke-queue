import { prisma } from '@/lib/prisma';
import { EventHeader } from './components/EventHeader';
import { EventStats } from './components/EventStats';
import { QueueTable } from './components/QueueTable';

interface DashboardProps {
	params: Promise<{ eventSlug: string }>;
}

export default async function SimpleDashboard({ params }: DashboardProps) {
	const { eventSlug } = await params;
	try {
		const event = await prisma.event.findUnique({
			where: { slug: eventSlug },
			include: {
				signups: {
					orderBy: { position: 'asc' },
				},
			},
		});
		if (!event) {
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

		const queuedCount = event.signups.filter(
			(s) => s.status === 'QUEUED'
		).length;
		const performingCount = event.signups.filter(
			(s) => s.status === 'PERFORMING'
		).length;
		const completedCount = event.signups.filter(
			(s) => s.status === 'COMPLETE'
		).length;

		return (
			<div className='container mx-auto py-8'>
				<div className='space-y-6'>
					<EventHeader
						name={event.name}
						date={new Date(event.date)}
					/>
					<EventStats
						queuedCount={queuedCount}
						performingCount={performingCount}
						completedCount={completedCount}
					/>
					<QueueTable
						eventName={event.name}
						signups={event.signups}
					/>
				</div>
			</div>
		);
	} catch (error) {
		console.error('Error fetching event:', error);
		return (
			<div className='container mx-auto py-8'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
					<p className='text-muted-foreground mb-4'>
						Failed to load event data. Please try again.
					</p>
				</div>
			</div>
		);
	}
}
