import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { ShareActions } from '@/components/ui/ShareActions';
import { EventCardHeader } from './EventCardHeader';

interface EventCardProps {
	event: {
		id: string;
		name: string;
		slug: string;
		date: Date;
	};
	signupCount: number;
	onShare: (slug: string, name: string) => void;
	onCopy: (url: string) => void;
}

export function EventCard({
	event,
	signupCount,
	onShare,
	onCopy,
}: EventCardProps) {
	const eventUrl = `${event.slug}`;
	const handleCopy = () => onCopy(eventUrl);
	const handleShare = () => onShare(event.slug, event.name);

	return (
		<Card className='hover:shadow-md transition-shadow'>
			<CardHeader>
				<EventCardHeader
					name={event.name}
					date={event.date}
				>
					<ShareActions
						onCopy={handleCopy}
						onShare={handleShare}
					/>
				</EventCardHeader>
			</CardHeader>
			<CardContent>
				<div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
					<Users className='h-4 w-4' />
					{signupCount} signups
				</div>
				<Button
					asChild
					className='w-full'
				>
					<Link href={`/dashboard/${event.slug}`}>
						<Settings className='mr-2 h-4 w-4' />
						Manage Queue
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
