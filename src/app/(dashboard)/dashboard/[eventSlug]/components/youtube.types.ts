import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../types';

export interface YouTubeResult {
	id: { videoId: string };
	snippet: {
		title: string;
		channelTitle: string;
		thumbnails: {
			default: { url: string };
			high?: { url: string };
		};
	};
}

export interface YouTubeCardProps {
	result: YouTubeResult;
	onSelect?: (result: YouTubeResult) => void;
	signup?: QueueItem;
	onUpdateStatus?: (signupId: string, status: SignupStatus) => void;
	currentPerformer?: QueueItem;
}
