import type { QueueItem, EventDetails, SignupStatus } from '../../types';
import { EventHeader } from './EventHeader';
import { EventStats } from './EventStats';
import { UpNextCard } from './UpNextCard';
import { QueueSection } from '../queue/QueueSection';
import { AttendeesSection } from '../attendees/AttendeesSection';

interface DashboardContentProps {
	event: EventDetails;
	signups: QueueItem[];
	allSignups: QueueItem[] | undefined;
	isLoadingAttendees: boolean;
	eventSlug: string;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
	onReorderSignups: (reorderedSignups: QueueItem[]) => void;
	onRefetchAll: () => void;
}

export function DashboardContent({
	event,
	signups,
	allSignups,
	isLoadingAttendees,
	eventSlug,
	onUpdateStatus,
	onRemoveSignup,
	onReorderSignups,
	onRefetchAll,
}: DashboardContentProps) {
	const queuedCount = signups.filter(
		(s) => s.status === 'QUEUED'
	).length;
	const completedCount = signups.filter(
		(s) => s.status === 'COMPLETE'
	).length;
	const performingSinger = signups.find(
		(s) => s.status === 'PERFORMING'
	);
	const upNextSinger = signups.find(
		(s) => s.status === 'QUEUED' && s.position === 1
	);

	return (
		<div className='container mx-auto py-8'>
			<div className='space-y-6'>
				<EventHeader
					eventName={event.name}
					eventDate={new Date(event.date)}
					eventSlug={eventSlug}
				/>

				<EventStats
					queuedCount={queuedCount}
					completedCount={completedCount}
					performingSinger={performingSinger}
				/>

				{upNextSinger && (
					<UpNextCard
						upNextSinger={upNextSinger}
						performingSinger={performingSinger}
						onUpdateStatus={onUpdateStatus}
					/>
				)}

				<QueueSection
					signups={signups}
					onUpdateStatus={onUpdateStatus}
					onRemoveSignup={onRemoveSignup}
					onReorderSignups={onReorderSignups}
				/>

				<AttendeesSection
					eventId={event.id}
					allSignups={allSignups}
					isLoadingAttendees={isLoadingAttendees}
					onUpdateStatus={onUpdateStatus}
					onRemoveSignup={onRemoveSignup}
					onRefetch={onRefetchAll}
				/>
			</div>
		</div>
	);
}
