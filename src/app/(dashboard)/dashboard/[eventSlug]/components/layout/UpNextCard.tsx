import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Music } from 'lucide-react';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../../types';
import { AutoYouTubeSearch } from '../youtube/AutoYouTubeSearch';

interface UpNextCardProps {
	upNextSinger: QueueItem;
	performingSinger?: QueueItem;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
}

export function UpNextCard({
	upNextSinger,
	performingSinger,
	onUpdateStatus,
}: UpNextCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Music className='w-5 h-5' />
					Up Next: {upNextSinger.singerName}
				</CardTitle>
				<CardDescription>
					{upNextSinger.songTitle} by {upNextSinger.artist}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AutoYouTubeSearch
					songTitle={upNextSinger.songTitle}
					artist={upNextSinger.artist}
					signup={upNextSinger}
					onUpdateStatus={onUpdateStatus}
					currentPerformer={performingSinger}
				/>
			</CardContent>
		</Card>
	);
}
