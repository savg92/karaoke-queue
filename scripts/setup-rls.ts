import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupRLS() {
	console.log('🔒 Setting up Row Level Security policies...');

	try {
		// Check if the profile exists for the user
		const existingProfile = await prisma.profile.findUnique({
			where: { email: '1992savg@gmail.com' },
		});

		if (existingProfile) {
			console.log('✅ Profile exists for 1992savg@gmail.com');
			console.log('Profile ID:', existingProfile.id);
			console.log(
				'Expected User ID from Supabase:',
				'bd88d120-79e4-4499-b00e-d5fbc9c25e50'
			);

			// Check if IDs match
			if (existingProfile.id !== 'bd88d120-79e4-4499-b00e-d5fbc9c25e50') {
				console.log('❌ Profile ID mismatch! Updating profile ID...');

				// Update the profile ID to match the Supabase user ID
				await prisma.profile.update({
					where: { email: '1992savg@gmail.com' },
					data: { id: 'bd88d120-79e4-4499-b00e-d5fbc9c25e50' },
				});

				console.log('✅ Updated profile ID to match Supabase user ID');

				// Also update role assignments to use the new user ID
				await prisma.$executeRaw`
          UPDATE role_assignments 
          SET user_id = 'bd88d120-79e4-4499-b00e-d5fbc9c25e50'
          WHERE user_id = ${existingProfile.id}
        `;

				console.log('✅ Updated role assignments with new user ID');
			}

			// Check role assignments
			const roleAssignments = await prisma.$queryRaw`
        SELECT * FROM role_assignments WHERE user_id = 'bd88d120-79e4-4499-b00e-d5fbc9c25e50'
      `;

			console.log(
				'Role assignments:',
				Array.isArray(roleAssignments) ? roleAssignments.length : 0
			);

			if (!Array.isArray(roleAssignments) || roleAssignments.length === 0) {
				console.log(
					'❌ No role assignments found! Creating SUPER_ADMIN role...'
				);

				// Create the SUPER_ADMIN role assignment
				try {
					await prisma.$executeRaw`
            INSERT INTO role_assignments (id, user_id, role, scope, assigned_by, is_active)
            VALUES (gen_random_uuid(), 'bd88d120-79e4-4499-b00e-d5fbc9c25e50', 'SUPER_ADMIN', 'GLOBAL', 'bd88d120-79e4-4499-b00e-d5fbc9c25e50', true)
          `;
					console.log('✅ Created SUPER_ADMIN role assignment');
				} catch (roleError) {
					console.error('Error creating role assignment:', roleError);
				}
			} else {
				console.log('✅ Role assignments found:');
				(
					roleAssignments as Array<{
						role: string;
						scope: string;
						is_active: boolean;
					}>
				).forEach((assignment) => {
					console.log(
						`  - ${assignment.role} (${assignment.scope}) - Active: ${assignment.is_active}`
					);
				});
			}
		} else {
			console.log('❌ No profile found for 1992savg@gmail.com');
		}

		// Now disable RLS to allow access
		console.log('🔓 Disabling RLS for all tables...');

		try {
			await prisma.$executeRaw`ALTER TABLE profiles DISABLE ROW LEVEL SECURITY`;
			console.log('✅ RLS disabled for profiles');
		} catch (e) {
			console.log(
				'⚠️ Could not disable RLS for profiles:',
				(e as Error).message
			);
		}

		try {
			await prisma.$executeRaw`ALTER TABLE role_assignments DISABLE ROW LEVEL SECURITY`;
			console.log('✅ RLS disabled for role_assignments');
		} catch (e) {
			console.log(
				'⚠️ Could not disable RLS for role_assignments:',
				(e as Error).message
			);
		}

		try {
			await prisma.$executeRaw`ALTER TABLE role_events DISABLE ROW LEVEL SECURITY`;
			console.log('✅ RLS disabled for role_events');
		} catch (e) {
			console.log(
				'⚠️ Could not disable RLS for role_events:',
				(e as Error).message
			);
		}

		try {
			await prisma.$executeRaw`ALTER TABLE events DISABLE ROW LEVEL SECURITY`;
			console.log('✅ RLS disabled for events');
		} catch (e) {
			console.log('⚠️ Could not disable RLS for events:', (e as Error).message);
		}

		try {
			await prisma.$executeRaw`ALTER TABLE signups DISABLE ROW LEVEL SECURITY`;
			console.log('✅ RLS disabled for signups');
		} catch (e) {
			console.log(
				'⚠️ Could not disable RLS for signups:',
				(e as Error).message
			);
		}
	} catch (error) {
		console.error('Error setting up RLS:', error);
	} finally {
		// Final summary for audit/debug
		try {
			const finalProfile = await prisma.profile.findUnique({
				where: { email: '1992savg@gmail.com' },
				select: { id: true, email: true, role: true },
			});
			const finalAssignments = await prisma.$queryRaw`
        SELECT role, scope, is_active FROM role_assignments WHERE user_id = 'bd88d120-79e4-4499-b00e-d5fbc9c25e50'
      `;
			console.log('--- FINAL STATE ---');
			console.log('Profile:', finalProfile);
			console.log('Role assignments:', finalAssignments);
			console.log('-------------------');
		} catch (e) {
			console.log('⚠️ Could not fetch final state:', (e as Error).message);
		}
		await prisma.$disconnect();
	}
}

setupRLS();
