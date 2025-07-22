import { prisma } from '@/lib/prisma';
import { UserRole, RoleEventType, RoleScope, Permission } from './types-fixed';
import type { RoleContext } from './types-fixed';

// Type definitions for Prisma query results
type RoleAssignmentWithUser = {
	id: string;
	role: string;
	scope: string;
	scopeId: string | null;
	user: {
		email: string;
		givenName: string | null;
		familyName: string | null;
	};
};

type RoleEventWithUser = {
	id: string;
	eventType: string;
	userId: string;
	role: string;
	permission: string | null;
	scopeId: string | null;
	timestamp: Date;
	success: boolean;
	user: {
		email: string;
		givenName: string | null;
		familyName: string | null;
	};
};

export class RBACManager {
	/**
	 * Get user's effective role for a given context
	 */
	static async getUserRole(
		userId: string,
		context?: RoleContext
	): Promise<UserRole> {
		// Get user's profile with default role
		const profile = await prisma.profile.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				givenName: true,
				familyName: true,
				picture: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!profile) {
			return UserRole.GUEST;
		}

		// RBAC: Always use profile.role as the source of truth for admin features
		// If the profile has role SUPER_ADMIN, override all assignments
		if (profile.role === UserRole.SUPER_ADMIN) {
			return UserRole.SUPER_ADMIN;
		}

		// Check for context-specific role assignments
		if (context?.eventId) {
			const roleAssignment = await prisma.roleAssignment.findFirst({
				where: {
					userId,
					scope: RoleScope.EVENT,
					scopeId: context.eventId,
					isActive: true,
					OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
				},
				orderBy: { assignedAt: 'desc' },
			});

			if (roleAssignment) {
				return roleAssignment.role as UserRole;
			}
		}

		// Check for global role assignments
		const globalRoleAssignment = await prisma.roleAssignment.findFirst({
			where: {
				userId,
				scope: RoleScope.GLOBAL,
				isActive: true,
				OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
			},
			orderBy: { assignedAt: 'desc' },
		});

		if (globalRoleAssignment) {
			return globalRoleAssignment.role as UserRole;
		}

		// Return default profile role
		return profile.role as UserRole;
	}

	/**
	 * Assign a role to a user
	 */
	static async assignRole(
		userId: string,
		role: UserRole,
		scope: RoleScope = RoleScope.EVENT,
		scopeId?: string,
		assignedBy?: string,
		expiresAt?: Date
	): Promise<void> {
		// Deactivate existing role assignments for this scope
		if (scopeId) {
			await prisma.roleAssignment.updateMany({
				where: {
					userId,
					scope,
					scopeId,
					isActive: true,
				},
				data: { isActive: false },
			});
		}

		// Create new role assignment
		await prisma.roleAssignment.create({
			data: {
				userId,
				role,
				scope,
				scopeId,
				assignedBy: assignedBy || 'system',
				expiresAt,
				isActive: true,
			},
		});

		// Log role assignment event
		await this.logEvent(
			RoleEventType.ROLE_ASSIGNED,
			userId,
			role,
			{
				userId,
				role,
				permissions: [], // Not used in logging
				scope: scope,
				eventId: scopeId,
			},
			{
				success: true,
				metadata: { scope, scopeId, assignedBy, expiresAt },
			}
		);

		// Role assignment created successfully
	}

	/**
	 * Revoke a role assignment
	 */
	static async revokeRole(
		userId: string,
		scope: RoleScope,
		scopeId?: string,
		revokedBy?: string
	): Promise<void> {
		const roleAssignment = await prisma.roleAssignment.findFirst({
			where: {
				userId,
				scope,
				scopeId,
				isActive: true,
			},
		});

		if (roleAssignment) {
			await prisma.roleAssignment.update({
				where: { id: roleAssignment.id },
				data: { isActive: false },
			});

			// Log role revocation event
			await this.logEvent(
				RoleEventType.ROLE_REVOKED,
				userId,
				roleAssignment.role as UserRole,
				{
					userId,
					role: roleAssignment.role as UserRole,
					permissions: [], // Not used in logging
					scope: scope,
					eventId: scopeId,
				},
				{
					success: true,
					metadata: { scope, scopeId, revokedBy },
				}
			);
		}
	}

	/**
	 * Log a role event to the database
	 */
	static async logEvent(
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
	): Promise<void> {
		await prisma.roleEvent.create({
			data: {
				eventType,
				userId,
				role,
				permission: options.permission,
				scopeId: context.eventId,
				ipAddress: options.ipAddress,
				userAgent: options.userAgent,
				success: options.success,
				metadata: JSON.parse(JSON.stringify(options.metadata || {})),
			},
		});
	}

	/**
	 * Get role analytics from database
	 */
	static async getAnalytics(days = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const [
			roleEvents,
			roleAssignments,
			unauthorizedAttempts,
			escalationAttempts,
		] = await Promise.all([
			// Recent role events
			prisma.roleEvent.findMany({
				where: {
					timestamp: { gte: startDate },
				},
				include: {
					user: {
						select: { email: true, givenName: true, familyName: true },
					},
				},
				orderBy: { timestamp: 'desc' },
				take: 100,
			}),

			// Current role assignments
			prisma.roleAssignment.findMany({
				where: {
					isActive: true,
					OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
				},
				include: {
					user: {
						select: { email: true, givenName: true, familyName: true },
					},
				},
			}),

			// Unauthorized access attempts
			prisma.roleEvent.count({
				where: {
					eventType: RoleEventType.UNAUTHORIZED_ACCESS,
					timestamp: { gte: startDate },
				},
			}),

			// Role escalation attempts
			prisma.roleEvent.count({
				where: {
					eventType: RoleEventType.ROLE_ESCALATION_ATTEMPT,
					timestamp: { gte: startDate },
				},
			}),
		]);

		// Process role distribution
		const roleDistribution = roleAssignments.reduce(
			(acc: Record<string, number>, assignment: RoleAssignmentWithUser) => {
				acc[assignment.role] = (acc[assignment.role] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		// Process permission usage
		const permissionUsage = roleEvents
			.filter((event: RoleEventWithUser) => event.permission)
			.reduce((acc: Record<string, number>, event: RoleEventWithUser) => {
				acc[event.permission!] = (acc[event.permission!] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);

		// Top active users
		const userActivity = roleEvents.reduce(
			(acc: Record<string, number>, event: RoleEventWithUser) => {
				acc[event.userId] = (acc[event.userId] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const topUsers = Object.entries(userActivity)
			.map(([userId, count]) => {
				const user = roleEvents.find(
					(e: RoleEventWithUser) => e.userId === userId
				)?.user;
				return {
					userId,
					email: user?.email || 'Unknown',
					name: user
						? `${user.givenName || ''} ${user.familyName || ''}`.trim()
						: 'Unknown',
					eventCount: count,
				};
			})
			.sort((a, b) => (b.eventCount as number) - (a.eventCount as number))
			.slice(0, 10);

		return {
			totalEvents: roleEvents.length,
			roleDistribution,
			permissionUsage,
			unauthorizedAttempts,
			escalationAttempts,
			topUsers,
			recentEvents: roleEvents.slice(0, 50),
		};
	}

	/**
	 * Get security violations from database
	 */
	static async getViolations(resolved = false) {
		return await prisma.roleEvent.findMany({
			where: {
				eventType: {
					in: [
						RoleEventType.UNAUTHORIZED_ACCESS,
						RoleEventType.ROLE_ESCALATION_ATTEMPT,
					],
				},
				success: false,
				metadata: resolved ? { path: ['resolved'], equals: true } : undefined,
			},
			include: {
				user: {
					select: { email: true, givenName: true, familyName: true },
				},
			},
			orderBy: { timestamp: 'desc' },
			take: 100,
		});
	}

	/**
	 * Clean up old role events (data retention)
	 */
	static async cleanupOldEvents(retentionDays = 90): Promise<void> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

		await prisma.roleEvent.deleteMany({
			where: {
				timestamp: { lt: cutoffDate },
			},
		});
	}
}
