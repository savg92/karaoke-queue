import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music } from 'lucide-react';
import type { QueueItem } from '../../types';

interface EventStatsProps {
	queuedCount: number;
	completedCount: number;
	performingSinger?: QueueItem;
}

export function EventStats({
	queuedCount,
	completedCount,
	performingSinger,
}: EventStatsProps) {
	return (
		<div className='grid gap-4 md:grid-cols-3'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Queue</CardTitle>
					<Badge variant='secondary'>{queuedCount}</Badge>
				</CardHeader>
				<CardContent>
					<p className='text-2xl font-bold'>{queuedCount}</p>
					<p className='text-xs text-muted-foreground'>Waiting to perform</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Now Performing</CardTitle>
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
					<p className='text-xs text-muted-foreground'>Finished performances</p>
				</CardContent>
			</Card>
		</div>
	);
}
