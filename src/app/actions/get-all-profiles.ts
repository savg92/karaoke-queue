'use server';

import { prisma } from '@/lib/prisma';

export async function getAllProfiles() {
	try {
		// Use Prisma to bypass RLS - this is for debug/admin purposes
		const profiles = await prisma.profile.findMany({
			select: {
				id: true,
				email: true,
				role: true,
			},
			orderBy: {
				role: 'desc', // SUPER_ADMIN first, then ADMIN, etc.
			},
		});

		return {
			success: true,
			profiles,
		};
	} catch (error) {
		console.error('Error fetching all profiles:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			profiles: [],
		};
	}
}
