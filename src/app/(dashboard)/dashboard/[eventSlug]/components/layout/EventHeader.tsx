import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { QRCodeDialog } from '../sharing/QRCodeDialog';

interface EventHeaderProps {
	eventName: string;
	eventDate: Date;
	eventSlug: string;
	onShare: () => void;
}

export function EventHeader({
	eventName,
	eventDate,
	eventSlug,
	onShare,
}: EventHeaderProps) {
	const eventUrl =
		typeof window !== 'undefined'
			? `${window.location.origin}/event/${eventSlug}`
			: '';

	return (
		<div className='flex justify-between items-start'>
			<div>
				<h1 className='text-3xl font-bold'>{eventName}</h1>
				<p className='text-muted-foreground'>
					{eventDate.toLocaleDateString()} - Host Dashboard
				</p>
			</div>
			<div className='flex gap-2'>
				<Button
					onClick={onShare}
					variant='outline'
				>
					<Share2 className='mr-2 h-4 w-4' />
					Share Event
				</Button>
				<QRCodeDialog
					eventUrl={eventUrl}
					eventName={eventName}
					eventDate={eventDate}
				/>
			</div>
		</div>
	);
}
