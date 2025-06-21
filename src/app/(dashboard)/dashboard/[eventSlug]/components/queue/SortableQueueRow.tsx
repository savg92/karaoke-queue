'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../../types';
import {
	statusConfig,
	performanceTypeConfig,
} from '../../constants/queue-config';
import { QueueRowActions } from './QueueRowActions';

interface SortableQueueRowProps {
	signup: QueueItem;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

export function SortableQueueRow({
	signup,
	onUpdateStatus,
	onRemoveSignup,
}: SortableQueueRowProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: signup.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<TableRow
			ref={setNodeRef}
			style={style}
			className={isDragging ? 'z-50' : ''}
		>
			<TableCell className='font-medium'>
				<div className='flex items-center gap-2'>
					{signup.status === SignupStatus.QUEUED && (
						<button
							className='cursor-grab hover:text-gray-600 active:cursor-grabbing'
							{...attributes}
							{...listeners}
						>
							<GripVertical className='h-4 w-4' />
						</button>
					)}
					{signup.status === SignupStatus.PERFORMING ? (
						<span className='text-amber-600 font-semibold'>Now</span>
					) : signup.status === SignupStatus.QUEUED ? (
						signup.position
					) : (
						<span className='text-muted-foreground'>-</span>
					)}
				</div>
			</TableCell>
			<TableCell>{signup.singerName}</TableCell>
			<TableCell className='font-medium'>{signup.songTitle}</TableCell>
			<TableCell className='text-muted-foreground'>{signup.artist}</TableCell>
			<TableCell>
				<Badge variant='outline'>
					{performanceTypeConfig[signup.performanceType]}
				</Badge>
			</TableCell>
			<TableCell>
				<Badge variant={statusConfig[signup.status].variant}>
					{statusConfig[signup.status].label}
				</Badge>
			</TableCell>
			<TableCell>
				<QueueRowActions
					signupId={signup.id}
					status={signup.status}
					onUpdateStatus={onUpdateStatus}
					onRemoveSignup={onRemoveSignup}
				/>
			</TableCell>
		</TableRow>
	);
}
