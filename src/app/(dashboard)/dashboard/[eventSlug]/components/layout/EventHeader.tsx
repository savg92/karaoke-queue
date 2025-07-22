import { useShareEvent } from '@/app/(dashboard)/dashboard/hooks/useShareEvent';
import { ShareActions } from '@/components/ui/ShareActions';
import { QRCodeDialog } from '../sharing/QRCodeDialog';
import { RoleBadge } from '@/components/rbac/RoleBadge';

interface EventHeaderProps {
	eventName: string;
	eventDate: Date;
	eventSlug: string;
}

export function EventHeader({
	eventName,
	eventDate,
	eventSlug,
}: EventHeaderProps) {
	const { handleShareEvent, copyToClipboard } = useShareEvent();

	const eventUrl =
		typeof window !== 'undefined'
			? `${window.location.origin}/event/${eventSlug}`
			: '';

	const onShare = () => handleShareEvent(eventSlug, eventName);
	const onCopy = () => copyToClipboard(eventSlug);

	return (
		<div
			className='flex justify-between items-start'
			data-event-slug={eventSlug}
		>
			<div>
				<div className='flex items-center gap-3 mb-2'>
					<h1 className='text-3xl font-bold'>{eventName}</h1>
					<RoleBadge eventId={eventSlug} />
				</div>
				<p className='text-muted-foreground'>
					{eventDate.toLocaleDateString()} - Host Dashboard
				</p>
			</div>
			<div className='flex items-center gap-2'>
				<ShareActions
					onShare={onShare}
					onCopy={onCopy}
					showText={true}
				/>
				<QRCodeDialog
					eventUrl={eventUrl}
					eventName={eventName}
					eventDate={eventDate}
				/>
			</div>
		</div>
	);
}
