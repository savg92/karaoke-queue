/**
 * Role Monitoring & Analytics System
 * Provides analytics and compliance reporting for role-based access control
 */

import {
	UserRole,
	Permission,
	RoleEventType,
	RoleContext,
} from './types-fixed';

// Additional types for monitoring
interface RoleMonitoringEvent {
	id: string;
	eventType: RoleEventType;
	userId: string;
	role: UserRole;
	permission?: Permission;
	timestamp: Date;
	details: string;
	ipAddress?: string;
	userAgent?: string;
}

interface RoleAnalytics {
	totalEvents: number;
	roleAssignments: Record<string, number>;
	permissionUsage: Record<string, number>;
	unauthorizedAttempts: number;
	escalationAttempts: number;
	topUsers: Array<{ userId: string; eventCount: number }>;
	recentEvents: RoleMonitoringEvent[];
}

interface RoleViolation {
	id: string;
	userId: string;
	violationType:
		| 'UNAUTHORIZED_ACCESS'
		| 'ROLE_ESCALATION'
		| 'SUSPICIOUS_ACTIVITY';
	severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	description: string;
	timestamp: Date;
	resolved: boolean;
	resolvedBy?: string;
	resolvedAt?: Date;
}

export class RoleMonitor {
	private events: RoleMonitoringEvent[] = [];
	private violations: RoleViolation[] = [];
	private readonly maxEvents = 10000; // Keep last 10k events in memory

	/**
	 * Log a role monitoring event
	 */
	logEvent(
		eventType: RoleEventType,
		userId: string,
		role: UserRole,
		context: RoleContext,
		options: {
			permission?: Permission;
			ipAddress?: string;
			userAgent?: string;
			success: boolean;
			metadata?: Record<string, unknown>;
		}
	): void {
		const event: RoleMonitoringEvent = {
			id: crypto.randomUUID(),
			eventType,
			userId,
			role,
			permission: options.permission,
			timestamp: new Date(),
			details: this.generateEventDetails(eventType, role, options),
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
		};

		this.events.push(event);
		this.trimEvents();

		// Check for violations
		this.checkForViolations(event);

		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
			const isSuperAdmin = role === 'SUPER_ADMIN';
			console.log(
				`[RBAC] ${eventType}: ${userId} (${role}) ${
					options.success ? 'SUCCESS' : 'FAILURE'
				}`,
				{ event, isSuperAdmin }
			);
		}
	}

	/**
	 * Check for potential security violations
	 */
	private checkForViolations(event: RoleMonitoringEvent): void {
		// Check for unauthorized access attempts
		if (event.eventType === 'PERMISSION_DENIED') {
			const recentFailures = this.events.filter(
				(e) =>
					e.userId === event.userId &&
					e.eventType === 'PERMISSION_DENIED' &&
					e.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
			);

			if (recentFailures.length >= 5) {
				this.createViolation(
					event.userId,
					'UNAUTHORIZED_ACCESS',
					'HIGH',
					`User attempted unauthorized access ${recentFailures.length} times in 5 minutes`
				);
			}
		}

		// Check for role escalation attempts
		if (event.eventType === RoleEventType.ROLE_ASSIGNED) {
			const previousRole = this.getRecentRoleForUser(event.userId);
			if (previousRole && this.isRoleEscalation(previousRole, event.role)) {
				this.createViolation(
					event.userId,
					'ROLE_ESCALATION',
					'CRITICAL',
					`User role escalated from ${previousRole} to ${event.role}`
				);
			}
		}
	}

	/**
	 * Create a security violation record
	 */
	private createViolation(
		userId: string,
		violationType: RoleViolation['violationType'],
		severity: RoleViolation['severity'],
		description: string
	): void {
		const violation: RoleViolation = {
			id: crypto.randomUUID(),
			userId,
			violationType,
			severity,
			description,
			timestamp: new Date(),
			resolved: false,
		};

		this.violations.push(violation);

		// In a real application, you might want to:
		// - Send alerts to security team
		// - Log to external security systems
		// - Trigger automated responses
		console.warn('[SECURITY VIOLATION]', violation);
	}

	/**
	 * Get analytics for the role monitoring system
	 */
	getAnalytics(): RoleAnalytics {
		const roleAssignments: Record<string, number> = {
			SUPER_ADMIN: 0,
			ADMIN: 0,
			HOST: 0,
			VIEWER: 0,
			GUEST: 0,
		};

		const permissionUsage: Record<string, number> = {
			READ_EVENTS: 0,
			CREATE_EVENTS: 0,
			UPDATE_EVENTS: 0,
			DELETE_EVENTS: 0,
			MANAGE_QUEUE: 0,
			ADMIN_ACCESS: 0,
			SUPER_ADMIN_ACCESS: 0,
		};

		this.events.forEach((event) => {
			roleAssignments[event.role] = (roleAssignments[event.role] || 0) + 1;
			if (event.permission) {
				permissionUsage[event.permission] =
					(permissionUsage[event.permission] || 0) + 1;
			}
		});

		const unauthorizedAttempts = this.events.filter(
			(e) => e.eventType === 'PERMISSION_DENIED'
		).length;

		const escalationAttempts = this.violations.filter(
			(v) => v.violationType === 'ROLE_ESCALATION'
		).length;

		// Get top users by activity
		const userActivity: Record<string, number> = {};
		this.events.forEach((event) => {
			userActivity[event.userId] = (userActivity[event.userId] || 0) + 1;
		});

		const topUsers = Object.entries(userActivity)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10)
			.map(([userId, eventCount]) => ({ userId, eventCount }));

		return {
			totalEvents: this.events.length,
			roleAssignments,
			permissionUsage,
			unauthorizedAttempts,
			escalationAttempts,
			topUsers,
			recentEvents: this.events.slice(-50), // Last 50 events
		};
	}

	/**
	 * Get violations with optional filtering
	 */
	getViolations(filters?: {
		userId?: string;
		severity?: RoleViolation['severity'];
		resolved?: boolean;
	}): RoleViolation[] {
		let violations = [...this.violations];

		if (filters) {
			if (filters.userId) {
				violations = violations.filter((v) => v.userId === filters.userId);
			}
			if (filters.severity) {
				violations = violations.filter((v) => v.severity === filters.severity);
			}
			if (filters.resolved !== undefined) {
				violations = violations.filter((v) => v.resolved === filters.resolved);
			}
		}

		return violations.sort(
			(a, b) => b.timestamp.getTime() - a.timestamp.getTime()
		);
	}

	/**
	 * Mark a violation as resolved
	 */
	resolveViolation(violationId: string, resolvedBy: string): boolean {
		const violation = this.violations.find((v) => v.id === violationId);
		if (!violation) return false;

		violation.resolved = true;
		violation.resolvedBy = resolvedBy;
		violation.resolvedAt = new Date();

		return true;
	}

	/**
	 * Helper methods
	 */
	private generateEventDetails(
		eventType: RoleEventType,
		role: UserRole,
		options: { success: boolean; permission?: Permission }
	): string {
		const status = options.success ? 'SUCCESS' : 'FAILURE';
		const permission = options.permission ? ` for ${options.permission}` : '';
		return `${eventType} - ${role}${permission} [${status}]`;
	}

	private trimEvents(): void {
		if (this.events.length > this.maxEvents) {
			this.events = this.events.slice(-this.maxEvents);
		}
	}

	private getRecentRoleForUser(userId: string): UserRole | null {
		const recentEvents = this.events
			.filter(
				(e) =>
					e.userId === userId && e.eventType === RoleEventType.ROLE_ASSIGNED
			)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

		return recentEvents.length > 1 ? recentEvents[1].role : null;
	}

	private isRoleEscalation(fromRole: UserRole, toRole: UserRole): boolean {
		const hierarchy: Record<UserRole, number> = {
			GUEST: 1,
			VIEWER: 2,
			HOST: 3,
			ADMIN: 4,
			SUPER_ADMIN: 5,
		};

		return hierarchy[toRole] > hierarchy[fromRole];
	}
}

// Singleton instance
export const roleMonitor = new RoleMonitor();

// Export types for use in other modules
export type { RoleMonitoringEvent, RoleContext, RoleAnalytics, RoleViolation };
