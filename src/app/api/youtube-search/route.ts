import { NextRequest, NextResponse } from 'next/server';

interface YouTubeSearchItem {
	id: { videoId: string };
	snippet: {
		title: string;
		channelTitle: string;
		thumbnails: {
			default: { url: string };
			high: { url: string };
		};
	};
}

interface YouTubeSearchResponse {
	items?: YouTubeSearchItem[];
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get('q');

	if (!query) {
		return NextResponse.json(
			{ error: 'Query parameter is required' },
			{ status: 400 }
		);
	}

	const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

	if (!YOUTUBE_API_KEY) {
		// Return mock data for development if no API key is provided
		return NextResponse.json({
			items: [
				{
					id: { videoId: 'mock1' },
					snippet: {
						title: `${query} - Mock Result 1`,
						channelTitle: 'Mock Channel',
						thumbnails: {
							default: {
								url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
							},
							high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
						},
					},
				},
				{
					id: { videoId: 'mock2' },
					snippet: {
						title: `${query} - Mock Result 2`,
						channelTitle: 'Another Mock Channel',
						thumbnails: {
							default: {
								url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
							},
							high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
						},
					},
				},
			],
		});
	}

	try {
		const response = await fetch(
			`https://www.googleapis.com/youtube/v3/search?` +
				`key=${YOUTUBE_API_KEY}&` +
				`q=${encodeURIComponent(query)}&` +
				`part=snippet&` +
				// `type=video&` +
				`maxResults=9&` +
				// `videoEmbeddable=true&` +
				`fields=items(id/videoId,snippet(title,channelTitle,thumbnails/default/url,thumbnails/high/url))`
		);

		if (!response.ok) {
			throw new Error('YouTube API request failed');
		}

		const data: YouTubeSearchResponse = await response.json();

		// Prioritize "Sing King" channel results
		if (data.items && Array.isArray(data.items)) {
			data.items.sort((a: YouTubeSearchItem, b: YouTubeSearchItem) => {
				const aIsSingKing = a.snippet?.channelTitle
					?.toLowerCase()
					.includes('sing king');
				const bIsSingKing = b.snippet?.channelTitle
					?.toLowerCase()
					.includes('sing king');

				// If one is Sing King and the other isn't, prioritize Sing King
				if (aIsSingKing && !bIsSingKing) return -1;
				if (!aIsSingKing && bIsSingKing) return 1;

				// If both are Sing King or neither are, maintain original order
				return 0;
			});
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('YouTube search error:', error);

		// Return mock data as fallback
		return NextResponse.json({
			items: [
				{
					id: { videoId: 'mock1' },
					snippet: {
						title: `${query} - Search Result 1 (Fallback)`,
						channelTitle: 'Fallback Channel',
						thumbnails: {
							default: { url: '/placeholder-thumbnail.jpg' },
							high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
						},
					},
				},
			],
		});
	}
}
