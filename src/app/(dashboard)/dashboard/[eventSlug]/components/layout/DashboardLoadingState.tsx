import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function DashboardLoadingState() {
	return (
		<div className='container mx-auto py-8'>
			<div className='space-y-6'>
				{/* Header with loading animation */}
				<div className='flex justify-between items-center'>
					<div>
						<div className='flex items-center gap-2 mb-2'>
							<Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
							<Skeleton className='h-8 w-64' />
						</div>
						<Skeleton className='h-4 w-48' />
					</div>
					<div className='flex gap-2'>
						<Skeleton className='h-10 w-32' />
						<Skeleton className='h-10 w-24' />
					</div>
				</div>

				{/* Event Stats Cards */}
				<div className='grid gap-4 md:grid-cols-3'>
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardHeader className='pb-2'>
								<Skeleton className='h-4 w-20' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-8 w-12 mb-1' />
								<Skeleton className='h-3 w-24' />
							</CardContent>
						</Card>
					))}
				</div>

				{/* Queue Section */}
				<Card>
					<CardHeader>
						<Skeleton className='h-6 w-32 mb-2' />
						<Skeleton className='h-4 w-64' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{/* Table header */}
							<div className='grid grid-cols-6 gap-4 pb-2 border-b'>
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton
										key={i}
										className='h-4 w-full'
									/>
								))}
							</div>
							{/* Table rows */}
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className='grid grid-cols-6 gap-4 py-2'
								>
									{Array.from({ length: 6 }).map((_, j) => (
										<Skeleton
											key={j}
											className='h-6 w-full'
										/>
									))}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Loading message */}
				<div className='text-center'>
					<div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
						<Loader2 className='h-4 w-4 animate-spin' />
						Loading event data...
					</div>
				</div>
			</div>
		</div>
	);
}
