/**
 * Role Monitoring Page
 *
 * Admin-only page for monitoring role assignments, security events, and user management
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EnhancedRoleMonitoringDashboard } from '@/components/rbac/EnhancedRoleMonitoringDashboard';
import { prisma } from '@/lib/prisma';

export default async function RoleMonitoringPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect('/login');
	}

	// Get user's role from the profiles table
	const profile = await prisma.profile.findUnique({
		where: { id: user.id },
		select: { role: true },
	});

	// Only SUPER_ADMIN and ADMIN can access role monitoring
	if (
		!profile ||
		(profile.role !== 'SUPER_ADMIN' && profile.role !== 'ADMIN')
	) {
		redirect('/dashboard');
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<EnhancedRoleMonitoringDashboard />
		</div>
	);
}
