'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Debug action to check and fix user profile issues
 */
export async function debugUserProfile() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { error: 'No authenticated user found' };
		}

		console.log('Debug - User ID:', user.id);
		console.log('Debug - User email:', user.email);

		// Check if profile exists in Prisma
		const prismaProfile = await prisma.profile.findUnique({
			where: { id: user.id },
		});

		console.log('Debug - Prisma profile:', prismaProfile);

		// Check if profile exists in Supabase
		const { data: supabaseProfile, error: supabaseError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		console.log('Debug - Supabase profile:', supabaseProfile);
		console.log('Debug - Supabase error:', supabaseError);

		// If no profile exists, create one
		if (!prismaProfile) {
			console.log('Creating new profile...');
			const newProfile = await prisma.profile.create({
				data: {
					id: user.id,
					email: user.email || 'unknown@example.com',
					role: 'SUPER_ADMIN', // Set as SUPER_ADMIN for testing
				},
			});
			console.log('Debug - Created profile:', newProfile);
			return { success: true, created: newProfile };
		}

		// If profile exists but has no role, update it
		if (prismaProfile && !prismaProfile.role) {
			console.log('Updating profile role...');
			const updatedProfile = await prisma.profile.update({
				where: { id: user.id },
				data: { role: 'SUPER_ADMIN' },
			});
			console.log('Debug - Updated profile:', updatedProfile);
			return { success: true, updated: updatedProfile };
		}

		return {
			success: true,
			existing: prismaProfile,
			supabaseProfile,
			supabaseError,
		};
	} catch (error) {
		console.error('Debug profile error:', error);
		return { error: error instanceof Error ? error.message : 'Unknown error' };
	}
}
