/**
 * RBAC React Hook
 *
 * Provides React hooks for role-based access control in components
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
	getCurrentUserRole,
	checkPermission,
	getRoleAnalytics,
} from '@/app/actions/rbac';
import { Permission, UserRole } from '@/lib/rbac/types-fixed';
import { hasPermission } from '@/lib/rbac/permissions-simple';

/**
 * Hook to get current user's role and permissions
 */
export function useUserRole(eventId?: string) {
	return useQuery({
		queryKey: ['userRole', eventId],
		queryFn: () => getCurrentUserRole(eventId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: Permission, eventId?: string) {
	return useQuery({
		queryKey: ['permission', permission, eventId],
		queryFn: () => checkPermission(permission, eventId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook to get role analytics (admin only)
 */
export function useRoleAnalytics() {
	return useQuery({
		queryKey: ['roleAnalytics'],
		queryFn: getRoleAnalytics,
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 30 * 1000, // Refresh every 30 seconds
	});
}

/**
 * Simplified permission checker hook
 * Enforces RBAC using the profile.role field from the database
 */
export function useHasPermission(
	permission: Permission,
	eventId?: string
): boolean {
	// Always use the latest profile.role from the DB for RBAC
	const { data: userRole } = useUserRole(eventId);
	if (!userRole) return false;
	return hasPermission(userRole.role as UserRole, permission);
}

/**
 * Check if user has any of multiple permissions (RBAC enforced)
 */
export function useHasAnyPermission(
	permissions: Permission[],
	eventId?: string
): boolean {
	const { data: userRole } = useUserRole(eventId);
	if (!userRole) return false;
	return permissions.some((permission) =>
		hasPermission(userRole.role as UserRole, permission)
	);
}

/**
 * Get user's current role (from profile.role)
 */
export function useCurrentRole(eventId?: string) {
	const { data: userRole } = useUserRole(eventId);
	return userRole?.role;
}

/**
 * Hook to fetch the `role` field from the profile table for the current user
 * Uses server action instead of direct Supabase query to avoid permission issues
 */
export function useProfileRole() {
	return useQuery({
		queryKey: ['profileRole'],
		queryFn: async () => {
			// Use the simple server action that works with Prisma
			const { getUserRoleSimple } = await import(
				'@/app/actions/get-user-role-simple'
			);
			const result = await getUserRoleSimple();
			console.log('useProfileRole - Server action result:', result);
			return result.role || null;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes - cache longer since roles don't change often
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchInterval: false, // Don't auto-refetch since roles rarely change
		refetchOnWindowFocus: false, // Don't refetch on focus
		retry: 3, // Retry failed requests
	});
}

// Use the profile.role field for RBAC (fallback if needed)
export function useProfileRoleRBAC() {
	return useQuery({
		queryKey: ['profileRoleRBAC'],
		queryFn: async () => {
			// Use the server action that works with Prisma instead of direct Supabase
			const { getCurrentUserRole } = await import('@/app/actions/rbac');
			const result = await getCurrentUserRole();
			return result.role || 'GUEST';
		},
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 30 * 1000, // Refresh every 30 seconds
	});
}

// Use the profile.role field for RBAC (fetch all profiles for debug)
export function useAllProfiles() {
	return useQuery({
		queryKey: ['allProfiles'],
		queryFn: async () => {
			const { getAllProfiles } = await import('@/app/actions/get-all-profiles');
			const result = await getAllProfiles();
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch profiles');
			}
			return result.profiles;
		},
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Check if current user is SUPER_ADMIN (strict RBAC)
 * Always uses latest value from DB
 */
export function useIsSuperAdmin(): boolean {
	const { data: role } = useProfileRole();
	return role === 'SUPER_ADMIN';
}

/**
 * Get all profiles with their roles (for admin/debug UIs)
 */
export function useAllProfileRoles() {
	return useQuery({
		queryKey: ['allProfileRoles'],
		queryFn: async () => {
			const { getAllProfiles } = await import('@/app/actions/get-all-profiles');
			const result = await getAllProfiles();
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch profiles');
			}
			return result.profiles;
		},
		staleTime: 30 * 1000,
		gcTime: 2 * 60 * 1000,
	});
}
