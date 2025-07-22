/**
 * RBAC Integration Server Action
 *
 * Provides server actions to integrate RBAC with the existing dashboard
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import {
	hasPermission,
	getPermissionsForRole,
} from '@/lib/rbac/permissions-simple';
import { UserRole, Permission } from '@/lib/rbac/types-fixed';
import { roleMonitor } from '@/lib/rbac/monitor';

/**
 * Get current user's role and permissions
 */
export async function getCurrentUserRole(eventId?: string) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { role: 'GUEST', permissions: [] };
		}

		// Simple approach: get profile by user ID (not email)
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		if (profileError) {
			console.error('Profile error:', profileError);
			// If profile doesn't exist, return GUEST
			return { role: 'GUEST', permissions: [] };
		}

		if (!profile) {
			return { role: 'GUEST', permissions: [] };
		}

		// Get role assignments separately
		const { data: roleAssignments, error: roleError } = await supabase
			.from('role_assignments')
			.select('*')
			.eq('userId', profile.id)
			.eq('isActive', true);

		if (roleError) {
			console.error('Role assignments error:', roleError);
			return { role: 'GUEST', permissions: [] };
		}

		// Find the highest role for the user
		let highestRole = 'GUEST';

		// RBAC: Always use profile.role as the source of truth for admin features
		// If the profile has role SUPER_ADMIN, override all assignments
		if (profile.role === 'SUPER_ADMIN') {
			highestRole = 'SUPER_ADMIN';
		} else if (roleAssignments && roleAssignments.length > 0) {
			type RoleAssignment = {
				isActive: boolean;
				expiresAt?: string | null;
				scope: string;
				scopeId?: string | null;
				role: UserRole;
			};
			const activeRoles = (roleAssignments as RoleAssignment[]).filter(
				(assignment) =>
					assignment.isActive &&
					(!assignment.expiresAt || new Date(assignment.expiresAt) > new Date())
			);

			// If eventId is provided, look for event-specific roles first
			if (eventId) {
				const eventRole = activeRoles.find(
					(assignment) =>
						assignment.scope === 'EVENT' && assignment.scopeId === eventId
				);
				if (eventRole) {
					highestRole = eventRole.role as UserRole;
				}
			}

			// If no event-specific role found, use the highest global role
			if (highestRole === 'GUEST') {
				const globalRoles = activeRoles.filter(
					(assignment) => assignment.scope === 'GLOBAL'
				);

				// Order roles by hierarchy: SUPER_ADMIN > ADMIN > HOST > VIEWER > GUEST
				const roleHierarchy = [
					'SUPER_ADMIN',
					'ADMIN',
					'HOST',
					'VIEWER',
					'GUEST',
				];

				for (const role of roleHierarchy) {
					if (globalRoles.some((assignment) => assignment.role === role)) {
						highestRole = role;
						break;
					}
				}
			}
		}

		const permissions = getPermissionsForRole(highestRole as UserRole);

		return { role: highestRole as UserRole, permissions, userId: user.id };
	} catch (error) {
		console.error('Error getting user role:', error);
		return { role: 'GUEST', permissions: [] };
	}
}

/**
 * Check if current user has permission
 */
export async function checkPermission(
	permission: Permission,
	eventId?: string
) {
	const { role, userId } = await getCurrentUserRole(eventId);

	const hasRequiredPermission = hasPermission(role as UserRole, permission);

	// Log permission check
	if (userId) {
		const permissions = getPermissionsForRole(role as UserRole);
		roleMonitor.logEvent(
			hasRequiredPermission ? 'PERMISSION_GRANTED' : 'PERMISSION_DENIED',
			userId,
			role as UserRole,
			{
				userId,
				role: role as UserRole,
				permissions,
				eventId,
			},
			{
				permission,
				success: hasRequiredPermission,
			}
		);
	}

	return { hasPermission: hasRequiredPermission, role };
}

/**
 * Get role monitoring analytics
 */
export async function getRoleAnalytics() {
	return roleMonitor.getAnalytics();
}

/**
 * Get security violations
 */
export async function getSecurityViolations() {
	return roleMonitor.getViolations();
}

/**
 * Resolve a security violation
 */
export async function resolveViolation(violationId: string) {
	const { userId } = await getCurrentUserRole();
	if (!userId) {
		throw new Error('Not authenticated');
	}

	return roleMonitor.resolveViolation(violationId, userId);
}
