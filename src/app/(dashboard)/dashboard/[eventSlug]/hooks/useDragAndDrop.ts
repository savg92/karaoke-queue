import {
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../types';

interface UseDragAndDropProps {
	signups: QueueItem[];
	onReorderSignups?: (signups: QueueItem[]) => void;
}

export function useDragAndDrop({
	signups,
	onReorderSignups,
}: UseDragAndDropProps) {
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

			// Update positions - only assign sequential positions to QUEUED signups
			const updatedSignups = reorderedSignups.map((signup) => {
				if (signup.status !== SignupStatus.QUEUED) {
					// Non-queued signups (PERFORMING, COMPLETE, etc.) should have position 0
					return { ...signup, position: 0 };
				}
				return signup;
			});

			// Assign sequential positions to QUEUED signups only
			const queuedSignups = updatedSignups.filter(
				(s) => s.status === SignupStatus.QUEUED
			);
			queuedSignups.forEach((signup, index) => {
				signup.position = index + 1;
			});

			if (onReorderSignups) {
				onReorderSignups(updatedSignups);
			}
		}
	};

	return {
		sensors,
		handleDragEnd,
	};
}
