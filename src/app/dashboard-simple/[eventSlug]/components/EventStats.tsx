import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventStatsProps {
	queuedCount: number;
	performingCount: number;
	completedCount: number;
}

export function EventStats({
	queuedCount,
	performingCount,
	completedCount,
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
					<CardTitle className='text-sm font-medium'>Performing</CardTitle>
					<Badge variant='default'>{performingCount}</Badge>
				</CardHeader>
				<CardContent>
					<p className='text-2xl font-bold'>{performingCount}</p>
					<p className='text-xs text-muted-foreground'>Currently on stage</p>
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
