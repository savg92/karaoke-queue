/**
 * Shared Constants for RBAC Components
 */

import type { UserRole, RoleEventType } from './types';

export const roleColors: Record<UserRole, string> = {
	SUPER_ADMIN: 'bg-red-100 text-red-800',
	ADMIN: 'bg-orange-100 text-orange-800',
	HOST: 'bg-blue-100 text-blue-800',
	VIEWER: 'bg-green-100 text-green-800',
	GUEST: 'bg-gray-100 text-gray-800',
};

export const eventTypeColors: Record<RoleEventType, string> = {
	ROLE_ASSIGNED: 'bg-green-100 text-green-800',
	ROLE_REVOKED: 'bg-red-100 text-red-800',
	PERMISSION_GRANTED: 'bg-blue-100 text-blue-800',
	PERMISSION_DENIED: 'bg-yellow-100 text-yellow-800',
	UNAUTHORIZED_ACCESS: 'bg-red-100 text-red-800',
	ROLE_ESCALATION_ATTEMPT: 'bg-purple-100 text-purple-800',
};

export const USER_ROLES: UserRole[] = [
	'SUPER_ADMIN',
	'ADMIN',
	'HOST',
	'VIEWER',
	'GUEST',
];
