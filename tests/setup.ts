import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: vi.fn(),
			replace: vi.fn(),
			back: vi.fn(),
			forward: vi.fn(),
			refresh: vi.fn(),
			prefetch: vi.fn(),
		};
	},
	useSearchParams() {
		return new URLSearchParams();
	},
	useParams() {
		return {};
	},
	usePathname() {
		return '';
	},
}));

// Mock next/image
vi.mock('next/image', () => ({
	default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
		React.createElement('img', props),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
	headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '127.0.0.1' })),
	cookies: vi.fn(async () => ({
		getAll: vi.fn(() => []),
		set: vi.fn(),
	})),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
