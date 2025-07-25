// This middleware is responsible for session management, route protection, and role monitoring.
// It intercepts incoming requests, refreshes the user's session, monitors for suspicious activity,
// and ensures that only authenticated users can access protected routes.

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import {
	logMiddlewareEvent,
	detectSuspiciousActivity,
} from '@/lib/rbac/middleware-monitoring';
import { RoleEventType } from './lib/rbac/types-fixed';

// The core middleware function that handles session updates, security monitoring, and redirection.
export async function middleware(request: NextRequest) {
	// Check for suspicious activity patterns
	const { isSuspicious, reasons } = detectSuspiciousActivity(request);

	if (isSuspicious) {
		// Log suspicious activity
		await logMiddlewareEvent(request, RoleEventType.UNAUTHORIZED_ACCESS, false);

		// Block obvious attacks
		if (
			reasons.some(
				(reason) =>
					reason.includes('SQL injection') || reason.includes('Path traversal')
			)
		) {
			return new NextResponse('Forbidden', { status: 403 });
		}
	}

	// The `updateSession` function from our helper refreshes the user's session
	// and returns both the user object and the response object.
	const { user, response } = await updateSession(request);

	// Define the routes that are considered public and do not require authentication.
	const publicRoutes = ['/login', '/auth/callback'];

	// Check if the current path is a protected route.
	// A route is protected if it's not in the publicRoutes list and doesn't start with /event/ (for public event signups).
	const isProtectedRoute =
		request.nextUrl.pathname !== '/' && // homepage is public
		!request.nextUrl.pathname.startsWith('/event/') && // event signup pages are public
		!publicRoutes.some((path) => request.nextUrl.pathname.startsWith(path));

	// If the user is not authenticated and is trying to access a protected route,
	// log the unauthorized access attempt and redirect them to the login page.
	if (!user && isProtectedRoute) {
		await logMiddlewareEvent(request, RoleEventType.UNAUTHORIZED_ACCESS, false);

		return NextResponse.redirect(new URL('/login', request.url));
	}

	// If the user is authenticated and tries to access the login page, redirect them
	// to their dashboard. This prevents logged-in users from seeing the login form again.
	if (user && request.nextUrl.pathname === '/login') {
		await logMiddlewareEvent(request, RoleEventType.PERMISSION_GRANTED, true);

		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	// Log successful access to protected routes
	if (user && isProtectedRoute) {
		await logMiddlewareEvent(request, RoleEventType.PERMISSION_GRANTED, true);
	}

	// IMPORTANT: You *must* return the response object as it is. This ensures
	// that cookies are properly set and the user's session is maintained.
	return response;
}

// The `config` object specifies which routes the middleware should run on.
// The matcher is configured to exclude static assets and API routes,
// focusing only on the pages that need session management.
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
