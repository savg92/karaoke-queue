import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../types';

interface UseYouTubePlayerProps {
	signup?: QueueItem;
	onUpdateStatus?: (signupId: string, status: SignupStatus) => void;
	currentPerformer?: QueueItem;
	videoId: string;
}

export function useYouTubePlayer({
	signup,
	onUpdateStatus,
	currentPerformer,
	videoId,
}: UseYouTubePlayerProps) {
	const handleOpenVideo = () => {
		const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

		if (signup && onUpdateStatus && signup.status !== SignupStatus.PERFORMING) {
			if (
				currentPerformer &&
				currentPerformer.status === SignupStatus.PERFORMING
			) {
				onUpdateStatus(currentPerformer.id, SignupStatus.COMPLETE);
			}
			onUpdateStatus(signup.id, SignupStatus.PERFORMING);
		}

		window.open(videoUrl, '_blank', 'noopener,noreferrer');
	};

	return { handleOpenVideo };
}
