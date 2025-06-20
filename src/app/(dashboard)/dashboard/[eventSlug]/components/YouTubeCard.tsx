'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface YouTubeResult {
	id: { videoId: string };
	snippet: {
		title: string;
		channelTitle: string;
		thumbnails: {
			default: { url: string };
		};
	};
}

interface YouTubeCardProps {
	result: YouTubeResult;
	onSelect?: (result: YouTubeResult) => void;
}

export function YouTubeCard({ result, onSelect }: YouTubeCardProps) {
	const videoUrl = `https://www.youtube.com/watch?v=${result.id.videoId}`;

	const handleOpenVideo = () => {
		window.open(videoUrl, '_blank', 'noopener,noreferrer');
	};

	const handleSelect = () => {
		if (onSelect) {
			onSelect(result);
		}
	};

	return (
		<Card className='hover:shadow-md transition-shadow duration-200 py-0'>
			<CardContent className='p-3'>
				<div className='flex flex-col gap-2'>
					{/* Thumbnail */}
					<div className='relative '>
						<Image
							src={result.snippet.thumbnails.default.url}
							alt={result.snippet.title}
							width={80}
							height={50}
							className='rounded-md object-cover w-full h-14'
						/>
						{/* <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-200'>
							<Play className='w-3 h-3 text-white' />
						</div> */}
					</div>

					{/* Content */}
					<div className='flex-1 min-w-0 px-2'>
						<h3 className='font-medium text-xs line-clamp-2 h-8 mb-1'>
							{result.snippet.title}
						</h3>
						<Badge
							variant='secondary'
							className=' mb-1 block w-fit p-1'
						>
							{result.snippet.channelTitle}
						</Badge>

						<div className='flex flex-col gap-1'>
							<Button
								// size='sm'
								variant='outline'
								onClick={handleOpenVideo}
								className='flex items-center justify-center gap-1 w-full h-6 text-xs'
							>
								<ExternalLink className='w-3 h-3' />
								Watch
							</Button>
							{onSelect && (
								<Button
									// size='sm'
									onClick={handleSelect}
									className='flex items-center justify-center gap-1 w-full h-6 text-xs'
								>
									<Play className='w-3 h-3' />
									Select
								</Button>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
