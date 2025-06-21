'use client';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../../types';
import { EditableRow } from './EditableRow';

interface AttendeesTableProps {
	signups: QueueItem[];
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

export function AttendeesTable({
	signups,
	onUpdateStatus,
	onRemoveSignup,
}: AttendeesTableProps) {
	// Sort signups by creation date (first come, first served for attendee view)
	const sortedSignups = [...signups].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);

	if (signups.length === 0) {
		return (
			<div className='rounded-md border'>
				<div className='p-8 text-center'>
					<p className='text-muted-foreground'>
						No attendees have signed up for this event yet.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-md border'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Singer</TableHead>
						<TableHead>Song</TableHead>
						<TableHead>Artist</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Queue Position</TableHead>
						<TableHead>Signed Up</TableHead>
						<TableHead>Performing Time</TableHead>
						<TableHead className='w-[100px]'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedSignups.map((signup) => (
						<EditableRow
							key={signup.id}
							signup={signup}
							onUpdateStatus={onUpdateStatus}
							onRemoveSignup={onRemoveSignup}
						/>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
