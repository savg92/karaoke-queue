import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncProfileRoles() {
	console.log('🔄 Syncing profile roles with role assignments...');

	try {
		// Get all profiles
		const profiles = await prisma.profile.findMany();
		console.log(`Found ${profiles.length} profiles`);

		for (const profile of profiles) {
			// Get the highest active role assignment for this user
			const roleAssignment = await prisma.roleAssignment.findFirst({
				where: {
					userId: profile.id,
					isActive: true,
					OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
				},
				orderBy: { assignedAt: 'desc' },
			});

			if (roleAssignment) {
				// Update profile role to match the role assignment
				await prisma.profile.update({
					where: { id: profile.id },
					data: { role: roleAssignment.role },
				});
				console.log(
					`✅ Updated ${profile.email} role from ${profile.role} to ${roleAssignment.role}`
				);
			} else {
				console.log(
					`⚠️ No active role assignment found for ${profile.email}, keeping current role: ${profile.role}`
				);
			}
		}

		console.log('✅ Profile role sync completed');
	} catch (error) {
		console.error('❌ Error syncing profile roles:', error);
	} finally {
		await prisma.$disconnect();
	}
}

syncProfileRoles();
