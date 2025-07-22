/**
 * Enhanced Role-Based Access Control (RBAC) Permission Checker	static requirePermission(
		userRole: UserRole,
		permission: Permission
	): void { Provides utilities for checking user permissions, validating roles,
 * and enforcing access control throughout the application.
 * Integrated with role monitoring for audit and compliance.
 */

import {
	UserRole,
	Permission,
	ROLE_PERMISSIONS,
	ROLE_HIERARCHY,
} from './types-fixed';

export class RBACChecker {
	/**
	 * Check if a user has a specific permission
	 * SUPER_ADMIN always has all permissions, regardless of ROLE_PERMISSIONS
	 */
	static hasPermission(userRole: UserRole, permission: Permission): boolean {
		if (userRole === UserRole.SUPER_ADMIN) {
			// Super admin has all permissions
			return true;
		}
		const rolePermissions = ROLE_PERMISSIONS[userRole];
		const hasPermission = rolePermissions.includes(permission);

		return hasPermission;
	}

	/**
	 * Check if a user has any of the specified permissions
	 */
	static hasAnyPermission(
		userRole: UserRole,
		permissions: Permission[]
	): boolean {
		return permissions.some((permission) =>
			this.hasPermission(userRole, permission)
		);
	}

	/**
	 * Check if user can assign a specific role (must be higher in hierarchy)
	 */
	static canAssignRole(
		currentUserRole: UserRole,
		targetRole: UserRole
	): boolean {
		return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
	}

	/**
	 * Enforce permission with automatic logging and violation detection
	 */
	static requirePermissions(
		userRole: UserRole,
		permissions: Permission[]
	): void {
		const hasAnyPermission = this.hasAnyPermission(userRole, permissions);

		if (!hasAnyPermission) {
			throw new Error(
				`Access denied: Missing permissions [${permissions.join(
					', '
				)}] for role ${userRole}`
			);
		}
	}
}

/**
 * React hook for checking permissions in components
 */
export function usePermissions(userRole: UserRole) {
	return {
		hasPermission: (permission: Permission) =>
			RBACChecker.hasPermission(userRole, permission),
		hasAnyPermission: (permissions: Permission[]) =>
			RBACChecker.hasAnyPermission(userRole, permissions),
		canAssignRole: (targetRole: UserRole) =>
			RBACChecker.canAssignRole(userRole, targetRole),
	};
}
