import { prisma } from '@/lib/prisma';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface DashboardProps {
	params: Promise<{ eventSlug: string }>;
}

export default async function SimpleDashboard({ params }: DashboardProps) {
	const { eventSlug } = await params;

	try {
		// Fetch event with signups using Prisma directly
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
					{/* Header */}
					<div className='flex justify-between items-start'>
						<div>
							<h1 className='text-3xl font-bold'>{event.name}</h1>
							<p className='text-muted-foreground'>
								{new Date(event.date).toLocaleDateString()} - Host Dashboard
							</p>
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
									Performing
								</CardTitle>
								<Badge variant='default'>{performingCount}</Badge>
							</CardHeader>
							<CardContent>
								<p className='text-2xl font-bold'>{performingCount}</p>
								<p className='text-xs text-muted-foreground'>
									Currently on stage
								</p>
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
							<CardDescription>Current queue for {event.name}</CardDescription>
						</CardHeader>
						<CardContent>
							{event.signups.length === 0 ? (
								<div className='text-center py-8'>
									<p className='text-muted-foreground'>
										No signups yet. Share your event link to get started!
									</p>
								</div>
							) : (
								<div className='rounded-md border'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className='w-[80px]'>Position</TableHead>
												<TableHead>Singer</TableHead>
												<TableHead>Song</TableHead>
												<TableHead>Artist</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Status</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{event.signups.map((signup) => (
												<TableRow key={signup.id}>
													<TableCell className='font-medium'>
														{signup.position}
													</TableCell>
													<TableCell>{signup.singerName}</TableCell>
													<TableCell className='font-medium'>
														{signup.songTitle}
													</TableCell>
													<TableCell className='text-muted-foreground'>
														{signup.artist}
													</TableCell>
													<TableCell>
														<Badge variant='outline'>
															{signup.performanceType}
														</Badge>
													</TableCell>
													<TableCell>
														<Badge
															variant={
																signup.status === 'QUEUED'
																	? 'secondary'
																	: signup.status === 'PERFORMING'
																	? 'default'
																	: signup.status === 'COMPLETE'
																	? 'outline'
																	: 'destructive'
															}
														>
															{signup.status}
														</Badge>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
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
