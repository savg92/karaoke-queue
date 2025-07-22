/**
 * Role Management Server Actions
 *
 * Server actions for checking and managing user roles in development
 */

'use server';

import {
	checkUserRoles,
	makeUserSuperAdmin,
	setupTestAdminUser,
} from '@/lib/rbac/role-management';
import { createClient } from '@/lib/supabase/server';

export async function getCurrentUserInfo() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { user: null, message: 'No authenticated user' };
		}

		// Also check the profile in Supabase
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		return {
			user: {
				id: user.id,
				email: user.email,
			},
			profile,
			profileError: profileError?.message,
			message: 'User found',
		};
	} catch (error) {
		console.error('Error getting current user:', error);
		return { user: null, message: 'Error getting user info' };
	}
}

export async function listAllUserRoles() {
	try {
		const profiles = await checkUserRoles();
		return { success: true, profiles };
	} catch (error) {
		console.error('Error listing user roles:', error);
		return { success: false, error: 'Failed to list user roles' };
	}
}

export async function promoteUserToSuperAdmin(email: string) {
	try {
		// Only allow this in development
		if (process.env.NODE_ENV !== 'development') {
			throw new Error('This action is only allowed in development');
		}

		const profile = await makeUserSuperAdmin(email);
		return { success: true, profile };
	} catch (error) {
		console.error('Error promoting user:', error);
		return {
			success: false,
			error: `Failed to promote ${email} to SUPER_ADMIN`,
		};
	}
}

export async function setupDevAdminUser(email: string) {
	try {
		// Only allow this in development
		if (process.env.NODE_ENV !== 'development') {
			throw new Error('This action is only allowed in development');
		}

		const profile = await setupTestAdminUser(email);
		return { success: true, profile };
	} catch (error) {
		console.error('Error setting up admin user:', error);
		return { success: false, error: `Failed to setup admin user ${email}` };
	}
}
