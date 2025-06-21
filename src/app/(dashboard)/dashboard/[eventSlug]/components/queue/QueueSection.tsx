import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../../types';
import { QueueTable } from './QueueTable';

interface QueueSectionProps {
	signups: QueueItem[];
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
	onReorderSignups: (reorderedSignups: QueueItem[]) => void;
}

export function QueueSection({
	signups,
	onUpdateStatus,
	onRemoveSignup,
	onReorderSignups,
}: QueueSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Karaoke Queue</CardTitle>
				<CardDescription>
					Manage your karaoke queue - mark singers as performing, complete, or
					remove them from the queue.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<QueueTable
					signups={signups}
					onUpdateStatus={onUpdateStatus}
					onRemoveSignup={onRemoveSignup}
					onReorderSignups={onReorderSignups}
				/>
			</CardContent>
		</Card>
	);
}
