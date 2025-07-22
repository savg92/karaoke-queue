/**
 * Debug RBAC Server Action
 *
 * Provides debugging information for RBAC issues
 */

'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Debug function to check current user authentication and role assignments
 */
export async function debugCurrentUser() {
	try {
		const supabase = await createClient();

		// Get authenticated user
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) {
			return {
				success: false,
				error: 'Auth error: ' + authError.message,
				user: null,
				profile: null,
				roleAssignments: [],
			};
		}

		if (!user) {
			return {
				success: false,
				error: 'No authenticated user',
				user: null,
				profile: null,
				roleAssignments: [],
			};
		}

		// Get user profile by ID (not email)
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		if (profileError) {
			return {
				success: false,
				error: 'Profile error: ' + profileError.message,
				user: { email: user.email, id: user.id },
				profile: null,
				roleAssignments: [],
			};
		}

		// Get role assignments
		const { data: roleAssignments, error: roleError } = await supabase
			.from('role_assignments')
			.select('*')
			.eq('user_id', profile.id)
			.eq('is_active', true);

		if (roleError) {
			return {
				success: false,
				error: 'Role assignments error: ' + roleError.message,
				user: { email: user.email, id: user.id },
				profile,
				roleAssignments: [],
			};
		}

		return {
			success: true,
			error: null,
			user: { email: user.email, id: user.id },
			profile,
			roleAssignments: roleAssignments || [],
		};
	} catch (error) {
		return {
			success: false,
			error: 'Unexpected error: ' + (error as Error).message,
			user: null,
			profile: null,
			roleAssignments: [],
		};
	}
}
