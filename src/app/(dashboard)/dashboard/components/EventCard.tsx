'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, Settings, Loader2 } from 'lucide-react';
import { ShareActions } from '@/components/ui/ShareActions';
import { EventCardHeader } from './EventCardHeader';
import { useNavigationFeedback } from '../hooks/useNavigationFeedback';
import { useShareEvent } from '../hooks/useShareEvent';

interface EventCardProps {
	event: {
		id: string;
		name: string;
		slug: string;
		date: Date;
	};
	signupCount: number;
}

export function EventCard({ event, signupCount }: EventCardProps) {
	const { isNavigating, navigateToEvent } = useNavigationFeedback({
		eventId: event.id,
		eventName: event.name,
	});
	const { handleShareEvent, copyToClipboard } = useShareEvent();

	const handleCopy = () => copyToClipboard(event.slug);
	const handleShare = () => handleShareEvent(event.slug, event.name);

	const handleManageClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		await navigateToEvent(event.slug);
	};

	return (
		<Card className='hover:shadow-lg transition-all duration-200 hover:scale-[1.02]'>
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
					className='w-full transition-all duration-200 hover:shadow-md'
					onClick={handleManageClick}
					disabled={isNavigating}
				>
					{isNavigating ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Loading...
						</>
					) : (
						<>
							<Settings className='mr-2 h-4 w-4' />
							Manage Queue
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
