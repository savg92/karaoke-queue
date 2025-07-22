'use server';

import { createClient } from '@/lib/supabase/server';

export async function testDatabaseAccess() {
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
				step: 'authentication',
			};
		}

		if (!user) {
			return {
				success: false,
				error: 'No authenticated user',
				step: 'authentication',
			};
		}

		// Test 1: Simple query to check basic access (fetch a real row)
		try {
			const { error: testError } = await supabase
				.from('profiles')
				.select('*')
				.limit(1)
				.single();

			if (testError) {
				return {
					success: false,
					error: 'Basic query failed: ' + testError.message,
					step: 'basic_query',
					user: { id: user.id, email: user.email },
				};
			}
		} catch (e) {
			return {
				success: false,
				error: 'Basic query exception: ' + (e as Error).message,
				step: 'basic_query_exception',
				user: { id: user.id, email: user.email },
			};
		}

		// Test 2: Try to find any profile
		try {
			const { data: anyProfile, error: anyError } = await supabase
				.from('profiles')
				.select('id, email')
				.limit(1)
				.single();

			if (anyError) {
				return {
					success: false,
					error: 'Any profile query failed: ' + anyError.message,
					step: 'any_profile',
					user: { id: user.id, email: user.email },
				};
			}

			return {
				success: true,
				error: null,
				step: 'completed',
				user: { id: user.id, email: user.email },
				foundProfile: anyProfile,
			};
		} catch (e) {
			return {
				success: false,
				error: 'Any profile exception: ' + (e as Error).message,
				step: 'any_profile_exception',
				user: { id: user.id, email: user.email },
			};
		}
	} catch (error) {
		return {
			success: false,
			error: 'Top level error: ' + (error as Error).message,
			step: 'top_level',
		};
	}
}
