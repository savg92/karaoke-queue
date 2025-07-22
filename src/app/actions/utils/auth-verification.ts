import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac/permissions-simple';
import { Permission, UserRole, RoleEventType } from '@/lib/rbac/types-fixed';
import { logRoleEvent } from '@/app/actions/role-monitoring';

export interface SignupWithEvent {
	id: string;
	eventId: string;
	event: {
		slug: string;
		host: {
			email: string;
		};
	};
}

/**
 * Verifies that the current user is authorized to modify a signup
 * Returns the signup with event data if authorized
 */
export async function verifySignupAccess(
	signupId: string
): Promise<SignupWithEvent> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect('/login');
	}

	// Get the signup to verify ownership through the event
	const signup = await prisma.signup.findUnique({
		where: { id: signupId },
		include: {
			event: {
				include: {
					host: true,
				},
			},
		},
	});

	if (!signup) {
		throw new Error('Signup not found');
	}

	// --- SUPER_ADMIN OVERRIDE ---
	const profile = await prisma.profile.findUnique({
		where: { id: user.id },
		select: { role: true },
	});
	if (profile && profile.role === UserRole.SUPER_ADMIN) {
		return signup;
	}
	// --- END SUPER_ADMIN OVERRIDE ---

	// Get user's role for this event
	const userRole = await getUserRoleForEvent(user.id, signup.eventId);
	// Check if user has permission to modify signups
	const canModifySignups = hasPermission(userRole, Permission.MANAGE_QUEUE);
	// Allow if user has permission OR is the event host (legacy check)
	if (!canModifySignups && signup.event.host.email !== user.email) {
		// Log security violation
		await logRoleEvent(RoleEventType.UNAUTHORIZED_ACCESS, user.id, userRole, {
			permission: Permission.MANAGE_QUEUE,
			scopeId: signup.eventId,
			success: false,
			metadata: { signupId, eventId: signup.eventId },
		});
		throw new Error(
			'Unauthorized: You are not the host of this event and do not have permission to modify signups'
		);
	}

	return signup;
}

/**
 * Helper function to get user role for an event
 */
async function getUserRoleForEvent(
	userId: string,
	eventId: string
): Promise<UserRole> {
	// SUPER_ADMIN OVERRIDE: If user is SUPER_ADMIN in profile, always return SUPER_ADMIN
	const profile = await prisma.profile.findUnique({
		where: { id: userId },
		select: { role: true },
	});
	if (profile && profile.role === UserRole.SUPER_ADMIN) {
		return UserRole.SUPER_ADMIN;
	}

	// Try to get role assignment from database
	const roleAssignment = await prisma.roleAssignment.findFirst({
		where: {
			userId,
			scopeId: eventId,
		},
	});

	if (roleAssignment) {
		return roleAssignment.role as UserRole;
	}

	// Fallback: check if user is event host
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		include: { host: true },
	});

	if (event?.host.id === userId) {
		return UserRole.HOST; // Return HOST role for event owners
	}

	return UserRole.GUEST; // Default role
}
