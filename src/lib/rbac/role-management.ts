/**
 * Role Management Script
 *
 * Simple script to check and update user roles for testing
 */

import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/rbac/types-fixed';

export async function checkUserRoles() {
	try {
		const profiles = await prisma.profile.findMany({
			select: {
				id: true,
				email: true,
				role: true,
			},
		});

		console.log('🔍 Current user roles:');
		profiles.forEach((profile: { id: string; email: string; role: string }) => {
			console.log(`📧 ${profile.email} - ${profile.role} (ID: ${profile.id})`);
		});

		return profiles;
	} catch (error) {
		console.error('❌ Error checking user roles:', error);
		throw error;
	}
}

export async function makeUserSuperAdmin(email: string) {
	try {
		const profile = await prisma.profile.update({
			where: { email },
			data: { role: UserRole.SUPER_ADMIN },
		});

		console.log(`✅ Updated ${email} to SUPER_ADMIN`);
		return profile;
	} catch (error) {
		console.error(`❌ Error updating ${email} to SUPER_ADMIN:`, error);
		throw error;
	}
}

export async function makeUserAdmin(email: string) {
	try {
		const profile = await prisma.profile.update({
			where: { email },
			data: { role: UserRole.ADMIN },
		});

		console.log(`✅ Updated ${email} to ADMIN`);
		return profile;
	} catch (error) {
		console.error(`❌ Error updating ${email} to ADMIN:`, error);
		throw error;
	}
}

// Example usage for testing
export async function setupTestAdminUser(email: string) {
	console.log(`🔧 Setting up test admin user: ${email}`);

	try {
		// First check if user exists
		const existingProfile = await prisma.profile.findUnique({
			where: { email },
		});

		if (!existingProfile) {
			console.log(`❌ User ${email} not found in database`);
			console.log('💡 User must sign up first before role can be assigned');
			return null;
		}

		// Update to SUPER_ADMIN for testing
		const updatedProfile = await makeUserSuperAdmin(email);
		console.log(
			`✅ ${email} is now SUPER_ADMIN and can access role monitoring`
		);

		return updatedProfile;
	} catch (error) {
		console.error('❌ Setup failed:', error);
		throw error;
	}
}
