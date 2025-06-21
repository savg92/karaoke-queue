import { Skeleton } from '@/components/ui/skeleton';

export function DashboardLoadingState() {
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
