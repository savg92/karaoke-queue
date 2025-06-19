// This file creates and exports a Supabase client for use in client-side components.
// It uses the createBrowserClient function from @supabase/ssr,
// which is specifically designed for browser environments.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
	// The createBrowserClient function initializes a new Supabase client.
	// It requires the Supabase project URL and the anonymous public key,
	// which are retrieved from environment variables.
	// These variables must be prefixed with NEXT_PUBLIC_ to be accessible on the client side.
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);
}
