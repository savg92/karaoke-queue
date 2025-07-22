/**
 * Utility function to get the base URL for the application.
 * This handles both development and production environments properly.
 */

import { headers } from 'next/headers';

export async function getBaseUrl(): Promise<string> {
	const headersList = await headers();

	// First, try to get the origin from headers
	const origin = headersList.get('origin');

	if (origin) {
		return origin;
	}

	// Fallback: construct from host and protocol headers
	const host = headersList.get('host');
	const protocol = headersList.get('x-forwarded-proto') || 'https';

	if (host) {
		return `${protocol}://${host}`;
	}

	// Final fallbacks based on environment
	if (process.env.NODE_ENV === 'development') {
		return 'http://localhost:3000';
	}

	// For production, you can either:
	// 1. Set NEXT_PUBLIC_SITE_URL environment variable
	// 2. Use Vercel's VERCEL_URL (automatically set in Vercel deployments)
	// 3. Hardcode your production domain

	if (process.env.NEXT_PUBLIC_SITE_URL) {
		return process.env.NEXT_PUBLIC_SITE_URL;
	}

	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	// Update this with your actual production domain
	return 'https://karaoke-queue.vercel.app';
}
