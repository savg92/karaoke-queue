/**
 * Role Monitoring Server Actions
 *
 * Provides server-side role monitoring functionality using the profiles.role field
 * and role_events table for comprehensive audit tracking
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { UserRole, RoleEventType, RoleEvent } from '@/lib/rbac/types-fixed';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { JsonValue } from '@prisma/client/runtime/library';

// Database query result types
interface RoleDistributionResult {
	role: UserRole;
	_count: {
		role: number;
	};
}

interface TopActiveUserResult {
	userId: string;
	_count: {
		userId: number;
	};
}

interface LastActivityResult {
	userId: string;
	_max: {
		timestamp: Date | null;
	};
}

interface SuspiciousIPResult {
	ipAddress: string | null;
	_count: {
		ipAddress: number;
	};
}

interface EventTypeCountResult {
	eventType: string;
	_count: {
		eventType: number;
	};
}

interface UserProfileResult {
	id: string;
	email: string;
}

interface RecentEventResult {
	id: string;
	eventType: RoleEventType;
	userId: string;
	role: UserRole;
	permission: string | null;
	scopeId: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	success: boolean;
	metadata: JsonValue | null;
	timestamp: Date;
	user: {
		email: string;
		givenName: string | null;
		familyName: string | null;
	};
}

// Role analytics return type

interface RoleAnalytics {
	totalEvents: number;
	roleDistribution: Record<UserRole, number>;
	recentEvents: RoleEvent[];
	unauthorizedAttempts: number;
	roleEscalationAttempts: number;
	topActiveUsers: Array<{
		userId: string;
		email: string;
		eventCount: number;
		lastActivity: Date;
	}>;
}

/**
 * Log a role monitoring event to the database
 */
export async function logRoleEvent(
	eventType: RoleEventType,
	userId: string,
	role: UserRole,
	options: {
		permission?: string;
		scopeId?: string;
		success: boolean;
		metadata?: Record<string, unknown>;
	}
) {
	try {
		const headersList = await headers();
		const ipAddress =
			headersList.get('x-forwarded-for') ||
			headersList.get('x-real-ip') ||
			'unknown';
		const userAgent = headersList.get('user-agent') || 'unknown';

		await prisma.roleEvent.create({
			data: {
				eventType,
				userId,
				role,
				permission: options.permission,
				scopeId: options.scopeId,
				ipAddress,
				userAgent,
				success: options.success,
				metadata: options.metadata
					? JSON.parse(JSON.stringify(options.metadata))
					: {},
			},
		});

		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
			const status = options.success ? 'SUCCESS' : 'FAILED';
			console.log(`[RBAC] ${eventType}: ${userId} (${role}) - ${status}`);
		}
	} catch (error) {
		console.error('Failed to log role event:', error);
	}
}

/**
 * Get comprehensive role analytics from the database
 */
export async function getRoleAnalytics(limit = 50): Promise<RoleAnalytics> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Unauthorized');
		}

		// Get current user's role
		const currentUserProfile = await prisma.profile.findUnique({
			where: { id: user.id },
			select: { role: true },
		});

		if (
			!currentUserProfile ||
			(currentUserProfile.role !== UserRole.SUPER_ADMIN &&
				currentUserProfile.role !== UserRole.ADMIN)
		) {
			throw new Error('Insufficient permissions');
		}

		// Execute all queries in parallel for better performance
		const [
			totalEvents,
			roleDistributionData,
			recentEventsData,
			eventTypeCounts,
			topActiveUsersData,
		] = await Promise.all([
			// Total event count
			prisma.roleEvent.count(),

			// Role distribution from profiles table
			prisma.profile.groupBy({
				by: ['role'],
				_count: { role: true },
			}),

			// Recent events with user details (single query with join)
			prisma.roleEvent.findMany({
				take: limit,
				orderBy: { timestamp: 'desc' },
				include: {
					user: {
						select: {
							email: true,
							givenName: true,
							familyName: true,
						},
					},
				},
			}),

			// Get event type counts in a single aggregation query
			prisma.roleEvent.groupBy({
				by: ['eventType'],
				_count: { eventType: true },
				where: {
					eventType: {
						in: [
							RoleEventType.UNAUTHORIZED_ACCESS,
							RoleEventType.ROLE_ESCALATION_ATTEMPT,
						],
					},
				},
			}),

			// Get top active users with user details in single query
			prisma.roleEvent.groupBy({
				by: ['userId'],
				_count: { userId: true },
				orderBy: { _count: { userId: 'desc' } },
				take: 10,
			}),
		]);

		// Process role distribution
		const roleDistribution: Record<UserRole, number> = {
			SUPER_ADMIN: 0,
			ADMIN: 0,
			HOST: 0,
			VIEWER: 0,
			GUEST: 0,
		};
		roleDistributionData.forEach((item: RoleDistributionResult) => {
			roleDistribution[item.role] = item._count.role;
		});

		// Process recent events - these are actual RoleEvent records
		const recentEvents: RoleEvent[] = recentEventsData.map(
			(event: RecentEventResult) => ({
				id: event.id,
				eventType: event.eventType,
				userId: event.userId,
				role: event.role,
				permission: event.permission || undefined,
				scopeId: event.scopeId || undefined,
				ipAddress: event.ipAddress || undefined,
				userAgent: event.userAgent || undefined,
				success: event.success,
				metadata: event.metadata as Record<string, unknown> | undefined,
				timestamp: event.timestamp,
				details: `${event.eventType} - ${event.success ? 'Success' : 'Failed'}`,
				user: {
					email: event.user.email,
					givenName: event.user.givenName,
					familyName: event.user.familyName,
				},
			})
		);

		// Process event type counts
		const unauthorizedAttempts =
			eventTypeCounts.find(
				(item: EventTypeCountResult) =>
					item.eventType === RoleEventType.UNAUTHORIZED_ACCESS
			)?._count.eventType || 0;

		const roleEscalationAttempts =
			eventTypeCounts.find(
				(item: EventTypeCountResult) =>
					item.eventType === RoleEventType.ROLE_ESCALATION_ATTEMPT
			)?._count.eventType || 0;

		// Get user details for top active users in a single query (avoid N+1)
		const userIds = topActiveUsersData.map(
			(item: TopActiveUserResult) => item.userId
		);
		const usersMap = await prisma.profile
			.findMany({
				where: { id: { in: userIds } },
				select: { id: true, email: true },
			})
			.then(
				(users: UserProfileResult[]) =>
					new Map(users.map((u: UserProfileResult) => [u.id, u]))
			);

		// Get last activity for top users in a single query
		const lastActivitiesMap = await prisma.roleEvent
			.groupBy({
				by: ['userId'],
				where: { userId: { in: userIds } },
				_max: { timestamp: true },
			})
			.then(
				(activities: LastActivityResult[]) =>
					new Map(
						activities.map((a: LastActivityResult) => [
							a.userId,
							a._max.timestamp,
						])
					)
			);

		const topActiveUsers = topActiveUsersData.map(
			(item: TopActiveUserResult) => ({
				userId: item.userId,
				email: usersMap.get(item.userId)?.email || 'Unknown',
				eventCount: item._count.userId,
				lastActivity: lastActivitiesMap.get(item.userId) || new Date(),
			})
		);

		return {
			totalEvents,
			roleDistribution,
			recentEvents,
			unauthorizedAttempts,
			roleEscalationAttempts,
			topActiveUsers,
		};
	} catch (error) {
		console.error('Failed to get role analytics:', error);
		throw error;
	}
}

/**
 * Update a user's role in the profiles table
 */
export async function updateUserRole(
	targetUserId: string,
	newRole: UserRole,
	reason?: string
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Unauthorized');
		}

		// Get current user's role
		const currentUserProfile = await prisma.profile.findUnique({
			where: { id: user.id },
			select: { role: true },
		});

		if (
			!currentUserProfile ||
			(currentUserProfile.role !== UserRole.SUPER_ADMIN &&
				currentUserProfile.role !== UserRole.ADMIN)
		) {
			// Log unauthorized attempt
			await logRoleEvent(
				RoleEventType.UNAUTHORIZED_ACCESS,
				user.id,
				currentUserProfile?.role || UserRole.GUEST,
				{
					success: false,
					metadata: { action: 'updateUserRole', targetUserId, newRole },
				}
			);

			throw new Error('Insufficient permissions');
		}

		// Get target user's current role
		const targetProfile = await prisma.profile.findUnique({
			where: { id: targetUserId },
			select: { role: true, email: true },
		});

		if (!targetProfile) {
			throw new Error('Target user not found');
		}

		// Prevent non-super-admins from escalating to SUPER_ADMIN
		if (
			newRole === UserRole.SUPER_ADMIN &&
			currentUserProfile.role !== UserRole.SUPER_ADMIN
		) {
			await logRoleEvent(
				RoleEventType.ROLE_ESCALATION_ATTEMPT,
				user.id,
				currentUserProfile.role,
				{
					success: false,
					metadata: { action: 'updateUserRole', targetUserId, newRole },
				}
			);

			throw new Error('Cannot assign SUPER_ADMIN role');
		}

		const oldRole = targetProfile.role;

		// Update the role
		await prisma.profile.update({
			where: { id: targetUserId },
			data: { role: newRole },
		});

		// Log the role assignment
		await logRoleEvent(
			RoleEventType.ROLE_ASSIGNED,
			user.id,
			currentUserProfile.role,
			{
				success: true,
				metadata: {
					action: 'updateUserRole',
					targetUserId,
					oldRole,
					newRole,
					reason,
					targetEmail: targetProfile.email,
				},
			}
		);

		revalidatePath('/dashboard');
		return { success: true };
	} catch (error) {
		console.error('Failed to update user role:', error);
		throw error;
	}
}

/**
 * Get all users with their current roles
 */
export async function getAllUsersWithRoles() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Unauthorized');
		}

		// Get current user's role
		const currentUserProfile = await prisma.profile.findUnique({
			where: { id: user.id },
			select: { role: true },
		});

		if (
			!currentUserProfile ||
			(currentUserProfile.role !== UserRole.SUPER_ADMIN &&
				currentUserProfile.role !== UserRole.ADMIN)
		) {
			throw new Error('Insufficient permissions');
		}

		const users = await prisma.profile.findMany({
			select: {
				id: true,
				email: true,
				givenName: true,
				familyName: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: [{ role: 'asc' }, { email: 'asc' }],
		});

		return users;
	} catch (error) {
		console.error('Failed to get users with roles:', error);
		throw error;
	}
}

/**
 * Check for suspicious role activity
 */
export async function checkSuspiciousActivity() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Unauthorized');
		}

		// Get current user's role
		const currentUserProfile = await prisma.profile.findUnique({
			where: { id: user.id },
			select: { role: true },
		});

		if (
			!currentUserProfile ||
			(currentUserProfile.role !== UserRole.SUPER_ADMIN &&
				currentUserProfile.role !== UserRole.ADMIN)
		) {
			throw new Error('Insufficient permissions');
		}

		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		// Find multiple failed attempts from the same IP
		const suspiciousIPs = await prisma.roleEvent.groupBy({
			by: ['ipAddress'],
			where: {
				success: false,
				timestamp: { gte: oneHourAgo },
			},
			_count: {
				ipAddress: true,
			},
			having: {
				ipAddress: {
					_count: {
						gt: 5, // More than 5 failed attempts in an hour
					},
				},
			},
		});

		// Find recent escalation attempts
		const escalationAttempts = await prisma.roleEvent.findMany({
			where: {
				eventType: RoleEventType.ROLE_ESCALATION_ATTEMPT,
				timestamp: { gte: oneHourAgo },
			},
			include: {
				user: {
					select: { email: true },
				},
			},
		});

		return {
			suspiciousIPs: suspiciousIPs.map((ip: SuspiciousIPResult) => ({
				ipAddress: ip.ipAddress || 'Unknown',
				failedAttempts: ip._count.ipAddress,
			})),
			recentEscalationAttempts: escalationAttempts,
		};
	} catch (error) {
		console.error('Failed to check suspicious activity:', error);
		throw error;
	}
}
