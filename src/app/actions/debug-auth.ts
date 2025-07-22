'use server';

import { createClient } from '@/lib/supabase/server';

export async function debugAuth() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError) {
			return {
				success: false,
				error: 'Auth error: ' + userError.message,
				user: null,
				profile: null,
				roleAssignments: null,
			};
		}

		if (!user) {
			return {
				success: false,
				error: 'No authenticated user',
				user: null,
				profile: null,
				roleAssignments: null,
			};
		}

		// Get the user's profile by ID instead of email
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		if (profileError) {
			return {
				success: false,
				error: 'Profile error: ' + profileError.message,
				user: {
					id: user.id,
					email: user.email,
				},
				profile: null,
				roleAssignments: null,
			};
		}

		// Get role assignments
		const { data: roleAssignments, error: roleError } = await supabase
			.from('role_assignments')
			.select('*')
			.eq('userId', profile.id);

		if (roleError) {
			return {
				success: false,
				error: 'Role assignments error: ' + roleError.message,
				user: {
					id: user.id,
					email: user.email,
				},
				profile,
				roleAssignments: null,
			};
		}

		return {
			success: true,
			error: null,
			user: {
				id: user.id,
				email: user.email,
			},
			profile,
			roleAssignments: roleAssignments || [],
		};
	} catch (error) {
		return {
			success: false,
			error: 'Catch error: ' + (error as Error).message,
			user: null,
			profile: null,
			roleAssignments: null,
		};
	}
}
