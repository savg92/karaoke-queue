'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface YouTubeSearchProps {
	onSelect?: (result: YouTubeResult) => void;
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

export function YouTubeSearch({ onSelect }: YouTubeSearchProps) {
	const [query, setQuery] = useState('');
	const [searchQuery, setSearchQuery] = useState('');

	// Use React Query to manage the search state
	const {
		data: results = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['youtube-search', searchQuery],
		queryFn: () => fetchYouTubeSearch(searchQuery),
		enabled: !!searchQuery.trim(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchQuery(query);
	};

	const handleSelect = (result: YouTubeResult) => {
		onSelect?.(result);
	};

	return (
		<div className='space-y-4'>
			<form
				onSubmit={handleSearch}
				className='flex gap-2'
			>
				<Input
					type='text'
					placeholder='Search for a song on YouTube...'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className='flex-1'
				/>
				<Button
					type='submit'
					disabled={isLoading}
				>
					<Search className='h-4 w-4 mr-2' />
					{isLoading ? 'Searching...' : 'Search'}
				</Button>
			</form>

			{error && (
				<div className='text-red-600 text-sm'>
					{error instanceof Error
						? error.message
						: 'Failed to search YouTube. Please try again.'}
				</div>
			)}

			{results.length > 0 && (
				<div className='space-y-2 max-h-64 overflow-y-auto'>
					{results.map((result) => (
						<Card
							key={result.id.videoId}
							className='cursor-pointer hover:bg-muted/50'
						>
							<CardContent className='p-3'>
								<div className='flex items-center gap-3'>
									<Image
										src={result.snippet.thumbnails.default.url}
										alt={result.snippet.title}
										width={64}
										height={48}
										className='w-16 h-12 object-cover rounded'
										onError={(e) => {
											// Fallback to a placeholder if image fails to load
											e.currentTarget.src = '/placeholder-thumbnail.jpg';
										}}
									/>
									<div className='flex-1 min-w-0'>
										<h4 className='text-sm font-medium truncate'>
											{result.snippet.title}
										</h4>
										<p className='text-xs text-muted-foreground truncate'>
											{result.snippet.channelTitle}
										</p>
									</div>
									<div className='flex items-center gap-2'>
										<Badge
											variant='secondary'
											className='text-xs'
										>
											<Play className='h-3 w-3 mr-1' />
											YouTube
										</Badge>
										<Button
											size='sm'
											variant='outline'
											onClick={() => handleSelect(result)}
										>
											Use This
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
