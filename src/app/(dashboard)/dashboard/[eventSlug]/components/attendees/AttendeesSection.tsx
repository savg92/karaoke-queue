import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../../types';
import { AttendeesTable } from './AttendeesTable';
import { AddAttendeeForm } from '../forms/AddAttendeeForm';

interface AttendeesSectionProps {
	eventId: string;
	allSignups: QueueItem[] | undefined;
	isLoadingAttendees: boolean;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
	onRefetch: () => void;
}

export function AttendeesSection({
	eventId,
	allSignups,
	isLoadingAttendees,
	onUpdateStatus,
	onRemoveSignup,
	onRefetch,
}: AttendeesSectionProps) {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>All Event Attendees</CardTitle>
						<CardDescription>
							Complete list of everyone who has signed up for your event,
							including completed and cancelled signups.
						</CardDescription>
					</div>
					<AddAttendeeForm
						eventId={eventId}
						onSuccess={onRefetch}
					/>
				</div>
			</CardHeader>
			<CardContent>
				{isLoadingAttendees ? (
					<div className='space-y-3'>
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className='h-12 bg-muted rounded animate-pulse'
							/>
						))}
					</div>
				) : allSignups ? (
					<AttendeesTable
						signups={allSignups}
						onUpdateStatus={onUpdateStatus}
						onRemoveSignup={onRemoveSignup}
					/>
				) : (
					<div className='text-center py-4'>
						<p className='text-muted-foreground'>
							No attendees data available.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
