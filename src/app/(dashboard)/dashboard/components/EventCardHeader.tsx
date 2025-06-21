import { Calendar } from 'lucide-react';

interface EventCardHeaderProps {
	name: string;
	date: Date;
	children?: React.ReactNode;
}

/**
 * Reusable event card header component
 * Can be used across different event card variations
 */
export function EventCardHeader({
	name,
	date,
	children,
}: EventCardHeaderProps) {
	return (
		<div className='flex items-start justify-between'>
			<div className='flex-1'>
				<div className='flex items-center gap-2 font-semibold'>
					<Calendar className='h-4 w-4' />
					{name}
				</div>
				<p className='text-sm text-muted-foreground mt-1'>
					{new Date(date).toLocaleDateString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					})}
				</p>
			</div>
			{children && <div className='ml-2'>{children}</div>}
		</div>
	);
}
