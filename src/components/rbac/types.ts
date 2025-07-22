/**
 * Shared Types for RBAC Components
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'HOST' | 'VIEWER' | 'GUEST';
export type RoleEventType =
	| 'ROLE_ASSIGNED'
	| 'ROLE_REVOKED'
	| 'PERMISSION_GRANTED'
	| 'PERMISSION_DENIED'
	| 'UNAUTHORIZED_ACCESS'
	| 'ROLE_ESCALATION_ATTEMPT';

export interface User {
	id: string;
	email: string;
	givenName?: string | null;
	familyName?: string | null;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}

export interface RoleEvent {
	id: string;
	eventType: RoleEventType;
	user: { email: string };
	role: UserRole;
	success: boolean;
	timestamp: Date | string;
	ipAddress?: string | null;
}

export interface SuspiciousIP {
	ipAddress: string | null;
	failedAttempts: number;
}

export interface EscalationAttempt {
	id: string;
	user: { email: string };
	timestamp: Date;
}
