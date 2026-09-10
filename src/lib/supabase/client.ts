// This file creates and exports a Supabase client for use in client-side components.
// It uses the createBrowserClient function from @supabase/ssr,
// which is specifically designed for browser environments.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
	const supabaseKey =
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		supabaseKey
	);
}
