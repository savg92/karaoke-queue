/**
 * Utility function to get the base URL for the application.
 * This handles both development and production environments properly.
 */

import { headers } from 'next/headers';

export async function getBaseUrl(): Promise<string> {
	const headersList = await headers();

	// First, try to get the origin from headers
	const origin = headersList.get('origin');

	// Debug logging for production
	console.log('getBaseUrl debug:', {
		origin,
		host: headersList.get('host'),
		protocol: headersList.get('x-forwarded-proto'),
		nodeEnv: process.env.NODE_ENV,
		vercelUrl: process.env.VERCEL_URL,
		siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
	});

	if (origin) {
		console.log('Using origin:', origin);
		return origin;
	}

	// Fallback: construct from host and protocol headers
	const host = headersList.get('host');
	const protocol = headersList.get('x-forwarded-proto') || 'https';

	if (host) {
		const constructedUrl = `${protocol}://${host}`;
		console.log('Using constructed URL:', constructedUrl);
		return constructedUrl;
	}

	// Check for explicit production URL environment variables first
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		console.log(
			'Using NEXT_PUBLIC_SITE_URL:',
			process.env.NEXT_PUBLIC_SITE_URL
		);
		return process.env.NEXT_PUBLIC_SITE_URL;
	}

	if (process.env.VERCEL_URL) {
		const vercelUrl = `https://${process.env.VERCEL_URL}`;
		console.log('Using VERCEL_URL:', vercelUrl);
		return vercelUrl;
	}

	// Only use localhost if we're definitely in development
	if (process.env.NODE_ENV === 'development') {
		console.log('Using localhost for development');
		return 'http://localhost:3000';
	}

	// Final fallback for production - update this with your actual domain
	const fallbackUrl = 'https://karaoke-queue.vercel.app';
	console.log('Using final fallback:', fallbackUrl);
	return fallbackUrl;
}
