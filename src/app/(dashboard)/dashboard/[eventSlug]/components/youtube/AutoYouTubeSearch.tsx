'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { YouTubeCard } from './YouTubeCard';
import type { QueueItem, SignupStatus } from '../../types';
import type { YouTubeResult } from './youtube.types';

interface AutoYouTubeSearchProps {
	songTitle: string;
	artist: string;
	// Optional signup and update function for "up next" functionality
	signup?: QueueItem;
	onUpdateStatus?: (signupId: string, status: SignupStatus) => void;
	// Current performing singer (to complete them when starting new performance)
	currentPerformer?: QueueItem;
}

// Function to fetch YouTube search results
const fetchYouTubeSearch = async (query: string): Promise<YouTubeResult[]> => {
	if (!query.trim()) {
		return [];
	}

	const response = await fetch(
		`/api/youtube-search?q=${encodeURIComponent(query)}`
	);

	if (!response.ok) {
		throw new Error('Search failed');
	}

	const data = await response.json();
	return data.items || [];
};

export function AutoYouTubeSearch({
	songTitle,
	artist,
	signup,
	onUpdateStatus,
	currentPerformer,
}: AutoYouTubeSearchProps) {
	const searchQuery = `${artist} ${songTitle} karaoke Sing King`;
	const [showAll, setShowAll] = useState(false);

	// Use React Query to automatically fetch results
	const {
		data: results = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['auto-youtube-search', searchQuery],
		queryFn: () => fetchYouTubeSearch(searchQuery),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	if (isLoading) {
		return (
			<div className='space-y-3'>
				<p className='text-sm text-muted-foreground'>
					Searching YouTube for karaoke tracks...
				</p>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr'>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className='space-y-1 p-2 border rounded-lg'
						>
							<Skeleton className='w-full h-12 rounded-md' />
							<Skeleton className='h-8 w-full' />
							<Skeleton className='h-4 w-1/2' />
							<Skeleton className='h-6 w-full' />
							<Skeleton className='h-6 w-full' />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center py-4'>
				<p className='text-sm text-red-600 mb-2'>
					Failed to search YouTube for karaoke tracks
				</p>
				<p className='text-xs text-muted-foreground'>
					{error instanceof Error ? error.message : 'Please try again later'}
				</p>
			</div>
		);
	}

	if (results.length === 0) {
		return (
			<div className='text-center py-4'>
				<p className='text-sm text-muted-foreground'>
					No YouTube results found for &ldquo;{songTitle}&rdquo; by {artist}
				</p>
			</div>
		);
	}

	const displayedResults = showAll ? results.slice(0, 9) : results.slice(0, 3);
	const hasMoreResults = results.length > 3;

	// Ensure displayedResults is always an array and filter out any invalid items
	const validResults = Array.isArray(displayedResults)
		? displayedResults.filter(
				(result) =>
					result &&
					result.id &&
					result.id.videoId &&
					result.snippet &&
					result.snippet.thumbnails &&
					(result.snippet.thumbnails.high?.url ||
						result.snippet.thumbnails.default?.url)
		  )
		: [];

	return (
		<div className='space-y-3'>
			<p className='text-sm text-muted-foreground'>
				YouTube karaoke tracks for this performance:
			</p>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr py-2'>
				{validResults.map((result) => (
					<YouTubeCard
						key={result.id.videoId}
						result={result}
						signup={signup}
						onUpdateStatus={onUpdateStatus}
						currentPerformer={currentPerformer}
					/>
				))}
			</div>

			{hasMoreResults && (
				<div className='text-center pt-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setShowAll(!showAll)}
						className='text-xs'
					>
						{showAll ? (
							<>
								<ChevronUp className='w-3 h-3 mr-1' />
								Show Less
							</>
						) : (
							<>
								<ChevronDown className='w-3 h-3 mr-1' />
								Show More
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}
