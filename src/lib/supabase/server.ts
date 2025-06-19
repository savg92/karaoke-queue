// This file contains the server-side Supabase client logic, which is essential for
// interacting with Supabase from server components, server actions, and middleware.
// It provides a unified function to create a Supabase client that is pre-configured
// with the necessary authentication handling for server-side contexts.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This function creates a Supabase client for use in Server Components,
// Server Actions, and Route Handlers. It uses the modern API from @supabase/ssr
// which handles cookie management automatically and is robust against errors
// when used in read-only contexts like Server Components.
export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						// The `setAll` method is called from a Server Component when the
						// user's session is refreshed. This can be ignored if you have
						// middleware refreshing user sessions.
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch {
						// An error is thrown when a Server Component tries to set a cookie.
						// This is expected behavior and can be safely ignored.
					}
				},
			},
		}
	);
}
