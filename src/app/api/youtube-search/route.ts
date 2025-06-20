import { NextRequest, NextResponse } from 'next/server';

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
						title: `${query} - Search Result 1`,
						channelTitle: 'Mock Channel',
						thumbnails: {
							default: { url: '/placeholder-thumbnail.jpg' },
						},
					},
				},
				{
					id: { videoId: 'mock2' },
					snippet: {
						title: `${query} - Search Result 2`,
						channelTitle: 'Another Mock Channel',
						thumbnails: {
							default: { url: '/placeholder-thumbnail.jpg' },
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
				`maxResults=10&` +
				// `videoEmbeddable=true&` +
				`fields=items(id/videoId,snippet(title,channelTitle,thumbnails/default/url))`
		);

		if (!response.ok) {
			throw new Error('YouTube API request failed');
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('YouTube search error:', error);

		// Return mock data as fallback
		return NextResponse.json({
			items: [
				{
					id: { videoId: 'fallback1' },
					snippet: {
						title: `${query} - Fallback Result`,
						channelTitle: 'Fallback Channel',
						thumbnails: {
							default: { url: '/placeholder-thumbnail.jpg' },
						},
					},
				},
			],
		});
	}
}
