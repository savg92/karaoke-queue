'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Simple server action to get user role from Prisma
 * This bypasses any permission issues with Supabase direct queries
 */
export async function getUserRoleSimple() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { role: null, error: 'No authenticated user' };
		}

		// Get profile from Prisma (not Supabase)
		const profile = await prisma.profile.findUnique({
			where: { id: user.id },
			select: { role: true },
		});

		return {
			role: profile?.role || null,
			userId: user.id,
			success: true,
		};
	} catch (error) {
		console.error('Error getting user role:', error);
		return {
			role: null,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}
