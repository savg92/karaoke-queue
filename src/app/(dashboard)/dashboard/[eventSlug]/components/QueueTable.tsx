'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	MoreHorizontal,
	Play,
	CheckCircle,
	X,
	GripVertical,
} from 'lucide-react';
import type { QueueItem } from '../types';
import { SignupStatus, PerformanceType } from '@prisma/client';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QueueTableProps {
	signups: QueueItem[];
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
	onReorderSignups?: (signups: QueueItem[]) => void;
}

const statusConfig = {
	[SignupStatus.QUEUED]: {
		label: 'Queued',
		variant: 'secondary' as const,
		color: 'bg-blue-100 text-blue-800',
	},
	[SignupStatus.PERFORMING]: {
		label: 'Performing',
		variant: 'default' as const,
		color: 'bg-green-100 text-green-800',
	},
	[SignupStatus.COMPLETE]: {
		label: 'Complete',
		variant: 'outline' as const,
		color: 'bg-gray-100 text-gray-800',
	},
	[SignupStatus.CANCELLED]: {
		label: 'Cancelled',
		variant: 'destructive' as const,
		color: 'bg-red-100 text-red-800',
	},
};

const performanceTypeConfig = {
	[PerformanceType.SOLO]: 'Solo',
	[PerformanceType.DUET]: 'Duet',
	[PerformanceType.GROUP]: 'Group',
};

interface SortableRowProps {
	signup: QueueItem;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

function SortableRow({
	signup,
	onUpdateStatus,
	onRemoveSignup,
}: SortableRowProps) {
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
					<button
						className='cursor-grab hover:text-gray-600 active:cursor-grabbing'
						{...attributes}
						{...listeners}
					>
						<GripVertical className='h-4 w-4' />
					</button>
					{signup.position}
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							className='h-8 w-8 p-0'
						>
							<span className='sr-only'>Open menu</span>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						{signup.status === SignupStatus.QUEUED && (
							<DropdownMenuItem
								onClick={() =>
									onUpdateStatus(signup.id, SignupStatus.PERFORMING)
								}
							>
								<Play className='mr-2 h-4 w-4' />
								Mark as Performing
							</DropdownMenuItem>
						)}
						{signup.status === SignupStatus.PERFORMING && (
							<DropdownMenuItem
								onClick={() => onUpdateStatus(signup.id, SignupStatus.COMPLETE)}
							>
								<CheckCircle className='mr-2 h-4 w-4' />
								Mark as Complete
							</DropdownMenuItem>
						)}
						{signup.status !== SignupStatus.CANCELLED && (
							<DropdownMenuItem
								onClick={() =>
									onUpdateStatus(signup.id, SignupStatus.CANCELLED)
								}
								className='text-red-600'
							>
								<X className='mr-2 h-4 w-4' />
								Cancel
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={() => onRemoveSignup(signup.id)}
							className='text-red-600'
						>
							<X className='mr-2 h-4 w-4' />
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}

export function QueueTable({
	signups,
	onUpdateStatus,
	onRemoveSignup,
	onReorderSignups,
}: QueueTableProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = signups.findIndex((item) => item.id === active.id);
			const newIndex = signups.findIndex((item) => item.id === over.id);

			const reorderedSignups = arrayMove(signups, oldIndex, newIndex);

			// Update positions
			const updatedSignups = reorderedSignups.map((signup, index) => ({
				...signup,
				position: index + 1,
			}));

			if (onReorderSignups) {
				onReorderSignups(updatedSignups);
			}
		}
	};

	if (signups.length === 0) {
		return (
			<div className='rounded-md border'>
				<div className='p-8 text-center'>
					<p className='text-muted-foreground'>
						No signups yet. Share your event link to get started!
					</p>
				</div>
			</div>
		);
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
								<SortableRow
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
