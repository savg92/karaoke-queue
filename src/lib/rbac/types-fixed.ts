/**
 * Core RBAC Type Definitions
 * Clean types that match the database schema exactly
 */

// User role type matching database enum values
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'HOST' | 'VIEWER' | 'GUEST';

// User role constants for value-based comparisons
export const UserRole = {
	SUPER_ADMIN: 'SUPER_ADMIN' as const,
	ADMIN: 'ADMIN' as const,
	HOST: 'HOST' as const,
	VIEWER: 'VIEWER' as const,
	GUEST: 'GUEST' as const,
} as const;

// Event type for audit logging - must match Prisma schema
export type RoleEventType =
	| 'ROLE_ASSIGNED'
	| 'ROLE_REVOKED'
	| 'PERMISSION_GRANTED'
	| 'PERMISSION_DENIED'
	| 'UNAUTHORIZED_ACCESS'
	| 'ROLE_ESCALATION_ATTEMPT';

// Event type constants for value-based comparisons
export const RoleEventType = {
	ROLE_ASSIGNED: 'ROLE_ASSIGNED' as const,
	ROLE_REVOKED: 'ROLE_REVOKED' as const,
	PERMISSION_GRANTED: 'PERMISSION_GRANTED' as const,
	PERMISSION_DENIED: 'PERMISSION_DENIED' as const,
	UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS' as const,
	ROLE_ESCALATION_ATTEMPT: 'ROLE_ESCALATION_ATTEMPT' as const,
} as const;

// Permission types
export type Permission =
	| 'READ_EVENTS'
	| 'CREATE_EVENTS'
	| 'UPDATE_EVENTS'
	| 'DELETE_EVENTS'
	| 'MANAGE_QUEUE'
	| 'ADMIN_ACCESS'
	| 'SUPER_ADMIN_ACCESS';

// Permission constants for value-based comparisons
export const Permission = {
	READ_EVENTS: 'READ_EVENTS' as const,
	CREATE_EVENTS: 'CREATE_EVENTS' as const,
	UPDATE_EVENTS: 'UPDATE_EVENTS' as const,
	DELETE_EVENTS: 'DELETE_EVENTS' as const,
	MANAGE_QUEUE: 'MANAGE_QUEUE' as const,
	ADMIN_ACCESS: 'ADMIN_ACCESS' as const,
	SUPER_ADMIN_ACCESS: 'SUPER_ADMIN_ACCESS' as const,
} as const;

// Role scope for context-aware permissions - must match Prisma schema
export type RoleScope = 'GLOBAL' | 'EVENT';

// Role scope constants for value-based comparisons
export const RoleScope = {
	GLOBAL: 'GLOBAL' as const,
	EVENT: 'EVENT' as const,
} as const;

// Role context for permissions and monitoring
export interface RoleContext {
	userId: string;
	role: UserRole;
	permissions: Permission[];
	scope?: RoleScope;
	eventId?: string;
	sessionId?: string;
}

// Role event interface for monitoring
export interface RoleEvent {
	id: string;
	eventType: RoleEventType;
	userId: string;
	role: UserRole;
	permission?: string;
	scopeId?: string;
	ipAddress?: string;
	userAgent?: string;
	success: boolean;
	metadata?: Record<string, unknown>;
	timestamp: Date;
	details: string; // Computed field for display
	user: {
		email: string;
		givenName?: string | null;
		familyName?: string | null;
	};
}

// Role permissions mapping using string literal keys
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	SUPER_ADMIN: [
		'READ_EVENTS',
		'CREATE_EVENTS',
		'UPDATE_EVENTS',
		'DELETE_EVENTS',
		'MANAGE_QUEUE',
		'ADMIN_ACCESS',
		'SUPER_ADMIN_ACCESS',
	],
	ADMIN: [
		'READ_EVENTS',
		'CREATE_EVENTS',
		'UPDATE_EVENTS',
		'DELETE_EVENTS',
		'MANAGE_QUEUE',
		'ADMIN_ACCESS',
	],
	HOST: ['READ_EVENTS', 'CREATE_EVENTS', 'UPDATE_EVENTS', 'MANAGE_QUEUE'],
	VIEWER: ['READ_EVENTS'],
	GUEST: [],
};

// Role hierarchy for access control
export const ROLE_HIERARCHY: Record<UserRole, number> = {
	SUPER_ADMIN: 5,
	ADMIN: 4,
	HOST: 3,
	VIEWER: 2,
	GUEST: 1,
};

// Role display configurations
export const ROLE_CONFIG = {
	SUPER_ADMIN: {
		label: 'Super Admin',
		color: 'destructive' as const,
		description: 'Full system access',
	},
	ADMIN: {
		label: 'Admin',
		color: 'secondary' as const,
		description: 'Administrative access',
	},
	HOST: {
		label: 'Host',
		color: 'default' as const,
		description: 'Event management',
	},
	VIEWER: {
		label: 'Viewer',
		color: 'outline' as const,
		description: 'Read-only access',
	},
	GUEST: {
		label: 'Guest',
		color: 'outline' as const,
		description: 'Limited access',
	},
} as const;

// Type for profile with role
export type ProfileWithRole = {
	id: string;
	email: string | null;
	role: UserRole | null;
	createdAt?: Date;
	updatedAt?: Date;
};

// Type for role analytics
export type RoleAnalytics = {
	totalUsers: number;
	roleDistribution: Record<UserRole, number>;
	recentEvents: Array<{
		id: string;
		eventType: RoleEventType;
		userId: string;
		details: string;
		timestamp: Date;
	}>;
};

// Utility type for checking permissions
export type PermissionCheck = {
	hasPermission: boolean;
	userRole: UserRole | null;
	requiredPermission: Permission;
};
