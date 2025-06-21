'use client';

import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { QueueItem } from '../../types';
import { SignupStatus } from '@prisma/client';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { QueueEmptyState } from './QueueEmptyState';
import { SortableQueueRow } from './SortableQueueRow';

interface QueueTableProps {
	signups: QueueItem[];
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
	onReorderSignups?: (signups: QueueItem[]) => void;
}

export function QueueTable({
	signups,
	onUpdateStatus,
	onRemoveSignup,
	onReorderSignups,
}: QueueTableProps) {
	const { sensors, handleDragEnd } = useDragAndDrop({
		signups,
		onReorderSignups,
	});

	if (signups.length === 0) {
		return <QueueEmptyState />;
	}

	return (
		<div className='rounded-md border'>
			<DndContext
				sensors={sensors}
				onDragEnd={handleDragEnd}
				collisionDetection={closestCenter}
			>
				<SortableContext
					items={signups.map((signup) => signup.id)}
					strategy={verticalListSortingStrategy}
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[120px]'>Position</TableHead>
								<TableHead>Singer</TableHead>
								<TableHead>Song</TableHead>
								<TableHead>Artist</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className='w-[50px]'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{signups.map((signup) => (
								<SortableQueueRow
									key={signup.id}
									signup={signup}
									onUpdateStatus={onUpdateStatus}
									onRemoveSignup={onRemoveSignup}
								/>
							))}
						</TableBody>
					</Table>
				</SortableContext>
			</DndContext>
		</div>
	);
}
