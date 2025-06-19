// This file provides the updateSession utility function for Next.js middleware.
// It handles refreshing Supabase Auth tokens and managing session state across requests.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
	// Create a response object that we can modify and return
	let supabaseResponse = NextResponse.next({
		request,
	});

	// Create the Supabase client with the modern cookie handling pattern
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					// Update request cookies for the current request
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value)
					);

					// Create a new response to ensure proper cookie handling
					supabaseResponse = NextResponse.next({
						request,
					});

					// Update response cookies for the browser
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				},
			},
		}
	);

	// IMPORTANT: Avoid writing any logic between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Return both the user and the properly configured response
	// The middleware will use these to make routing decisions
	return { user, response: supabaseResponse };
}
