'use client';

export function QueueEmptyState() {
	return (
		<div className='rounded-md border'>
			<div className='p-8 text-center'>
				<p className='text-muted-foreground'>
					No signups yet. Share your event link to get started!
				</p>
			</div>
		</div>
	);
}
