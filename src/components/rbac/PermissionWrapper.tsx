/**
 * Permission Wrapper Component
 *
 * Conditionally renders children based on user permissions
 */

'use client';

import { ReactNode } from 'react';
import { Permission, UserRole } from '@/lib/rbac/types-fixed';
import { useProfileRole } from '@/lib/hooks/useRBAC';

interface PermissionWrapperProps {
	children: ReactNode;
	permission?: Permission;
	permissions?: Permission[];
	role?: UserRole;
	roles?: UserRole[];
	eventId?: string;
	fallback?: ReactNode;
}

export function PermissionWrapper({
	children,
	role,
	roles,
	fallback = null,
}: PermissionWrapperProps) {
	const { data: profileRole, isLoading } = useProfileRole();

	if (isLoading) return null;

	// Check role-based access
	if (role && profileRole !== role) {
		return <>{fallback}</>;
	}

	if (roles && profileRole && !roles.includes(profileRole)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

// Removed AdminOnly and HostOrAbove for explicit RBAC usage
