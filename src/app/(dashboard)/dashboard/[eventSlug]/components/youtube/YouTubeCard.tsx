'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { YouTubeThumbnail } from './YouTubeThumbnail';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import type { YouTubeCardProps } from './youtube.types';
import { Button } from '@/components/ui/button';

export function YouTubeCard({
	result,
	signup,
	onUpdateStatus,
	currentPerformer,
}: YouTubeCardProps) {
	const { handleOpenVideo } = useYouTubePlayer({
		videoId: result.id.videoId,
		signup,
		onUpdateStatus,
		currentPerformer,
	});

	// Use high-resolution thumbnail if available, otherwise fall back to default
	const thumbnailUrl =
		result.snippet.thumbnails.high?.url ||
		result.snippet.thumbnails.default.url;

	return (
		<Card className='hover:shadow-md transition-shadow duration-200 py-0'>
			<CardContent className='p-3'>
				<div className='flex flex-col gap-2'>
					<YouTubeThumbnail
						thumbnailUrl={thumbnailUrl}
						title={result.snippet.title}
						onOpen={handleOpenVideo}
					/>
					<div className='flex-1 min-w-0 px-2'>
						<h3 className='font-medium text-xs line-clamp-2 h-8 mb-1'>
							{result.snippet.title}
						</h3>
						<Badge
							variant='secondary'
							className='p-1'
						>
							{result.snippet.channelTitle}
						</Badge>
					</div>
					<div className='flex items-center justify-between pt-2'>
						<Button
							variant='default'
							size='sm'
							className='w-full'
							onClick={handleOpenVideo}
						>
							Watch
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
