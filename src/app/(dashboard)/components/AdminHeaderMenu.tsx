/**
 * Admin Header Menu Component
 *
 * Provides persistent navigation for admin functions in the header
 * Only visible to Super Admins and Admins
 */

'use client';

// import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogHeader,
// 	DialogTitle,
// } from '@/components/ui/dialog';
import { Shield, BarChart3, Users, Settings } from 'lucide-react';
import { useProfileRole } from '@/lib/hooks/useRBAC';
// import { EnhancedRoleMonitoringDashboard } from '@/components/rbac/EnhancedRoleMonitoringDashboard';
import Link from 'next/link';

export function AdminHeaderMenu() {
	// const [showRoleMonitoring, setShowRoleMonitoring] = useState(false);
	const { data: profileRole, isLoading } = useProfileRole();

	// Debug logging
	// console.log('AdminHeaderMenu - Role:', profileRole, 'Loading:', isLoading);

	// Show loading state immediately
	if (isLoading) {
		return (
			<Button
				variant='outline'
				size='sm'
				disabled
			>
				<Shield className='h-4 w-4 mr-2 animate-pulse' />
				Loading...
			</Button>
		);
	}

	// Show for both SUPER_ADMIN and ADMIN users
	if (profileRole !== 'SUPER_ADMIN' && profileRole !== 'ADMIN') {
		// In development, show debug info
		if (process.env.NODE_ENV === 'development') {
			return (
				<Button
					variant='outline'
					size='sm'
					disabled
				>
					<Shield className='h-4 w-4 mr-2' />
					Admin ({profileRole || 'No Role'})
				</Button>
			);
		}
		return null;
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='outline'
						size='sm'
					>
						<Shield className='h-4 w-4 mr-2' />
						{profileRole === 'SUPER_ADMIN' ? 'Super Admin Menu' : 'Admin Menu'}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align='end'
					className='w-56'
				>
					<DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{/* <DropdownMenuItem onClick={() => setShowRoleMonitoring(true)}>
						<BarChart3 className='h-4 w-4 mr-2' />
						Role Monitoring (Quick View)
					</DropdownMenuItem> */}

					<DropdownMenuItem asChild>
						<Link href='/dashboard/admin/role-monitoring'>
							<BarChart3 className='h-4 w-4 mr-2' />
							Role Monitoring (Full Page)
						</Link>
					</DropdownMenuItem>

					<DropdownMenuItem disabled>
						<Users className='h-4 w-4 mr-2' />
						User Management
					</DropdownMenuItem>

					<DropdownMenuItem disabled>
						<Settings className='h-4 w-4 mr-2' />
						System Settings
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Role Monitoring Dialog */}
			{/* <Dialog
				open={showRoleMonitoring}
				onOpenChange={setShowRoleMonitoring}
			>
				<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Shield className='h-5 w-5' />
							Role Monitoring Dashboard
						</DialogTitle>
						<DialogDescription>
							Monitor role assignments, permissions, and security events across
							the system.
						</DialogDescription>
					</DialogHeader>
					<div className='mt-4'>
						<EnhancedRoleMonitoringDashboard />
					</div>
				</DialogContent>
			</Dialog> */}
		</>
	);
}
