/**
 * Simple Permission Functions
 * Standalone functions for RBAC permission checking
 * Wraps the enhanced RBAC checker for backward compatibility
 */

import { RBACChecker } from './permissions-enhanced';
import {
	UserRole,
	Permission,
	ROLE_PERMISSIONS,
	ROLE_HIERARCHY,
} from './types-fixed';

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
	userRole: UserRole,
	permission: Permission
): boolean {
	return RBACChecker.hasPermission(userRole, permission);
}

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(userRole: UserRole): Permission[] {
	if (userRole === UserRole.SUPER_ADMIN) {
		// Super admin has all permissions
		return [
			Permission.READ_EVENTS,
			Permission.CREATE_EVENTS,
			Permission.UPDATE_EVENTS,
			Permission.DELETE_EVENTS,
			Permission.MANAGE_QUEUE,
			Permission.ADMIN_ACCESS,
			Permission.SUPER_ADMIN_ACCESS,
		];
	}

	return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if a user can assign a specific role (must be higher in hierarchy)
 */
export function canAssignRole(
	currentUserRole: UserRole,
	targetRole: UserRole
): boolean {
	return RBACChecker.canAssignRole(currentUserRole, targetRole);
}

/**
 * Get the highest role from a list of roles based on hierarchy
 */
export function getHighestRole(roles: UserRole[]): UserRole {
	if (roles.length === 0) return UserRole.GUEST;

	return roles.reduce((highest, current) => {
		const currentLevel = ROLE_HIERARCHY[current] || 0;
		const highestLevel = ROLE_HIERARCHY[highest] || 0;
		return currentLevel > highestLevel ? current : highest;
	}, roles[0]);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
	userRole: UserRole,
	permissions: Permission[]
): boolean {
	return RBACChecker.hasAnyPermission(userRole, permissions);
}
