/**
 * Role Monitoring Middleware Extension
 *
 * Automatically logs role-related events and monitors for suspicious activity
 */

import { NextRequest } from 'next/server';
import { RoleEventType, UserRole } from './types-fixed';

/**
 * Enhanced middleware helper that logs role events (disabled in edge runtime)
 */
export async function logMiddlewareEvent(
	request: NextRequest,
	eventType: RoleEventType,
	success: boolean
) {
	// Note: Database logging is disabled in middleware due to edge runtime limitations
	// Role events will be logged through server actions instead
	console.log(
		`[MIDDLEWARE] ${eventType}: ${success ? 'SUCCESS' : 'FAILED'} - ${
			request.nextUrl.pathname
		}`
	);
}

/**
 * Check if a user has permission for a specific action
 */
export function hasPermissionForRole(
	userRole: UserRole,
	requiredRole: UserRole
): boolean {
	const roleHierarchy = {
		[UserRole.SUPER_ADMIN]: 5,
		[UserRole.ADMIN]: 4,
		[UserRole.HOST]: 3,
		[UserRole.VIEWER]: 2,
		[UserRole.GUEST]: 1,
	};

	return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Detect suspicious patterns in requests
 */
export function detectSuspiciousActivity(request: NextRequest): {
	isSuspicious: boolean;
	reasons: string[];
} {
	const reasons: string[] = [];

	// Check for common attack patterns
	const path = request.nextUrl.pathname.toLowerCase();
	const query = request.nextUrl.search.toLowerCase();

	// SQL injection patterns
	const sqlPatterns = [
		'union select',
		'drop table',
		'insert into',
		'delete from',
		'update set',
		'exec(',
		'script>',
		'<script',
	];

	const combinedString = `${path} ${query}`;
	for (const pattern of sqlPatterns) {
		if (combinedString.includes(pattern)) {
			reasons.push(`Potential SQL injection: ${pattern}`);
		}
	}

	// Path traversal
	if (path.includes('../') || path.includes('..\\\\')) {
		reasons.push('Path traversal attempt');
	}

	// Admin panel brute force
	if (path.includes('/admin') || path.includes('/dashboard')) {
		const userAgent = request.headers.get('user-agent') || '';
		if (
			userAgent.toLowerCase().includes('bot') ||
			userAgent.toLowerCase().includes('crawler')
		) {
			reasons.push('Bot accessing admin areas');
		}
	}

	return {
		isSuspicious: reasons.length > 0,
		reasons,
	};
}
