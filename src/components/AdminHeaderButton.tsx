'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/rbac/types-fixed';

/**
 * Admin header button that appears for SUPER_ADMIN and ADMIN users
 */
export function AdminHeaderButton() {
	const [userRole, setUserRole] = useState<UserRole | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [debugInfo, setDebugInfo] = useState('');

	useEffect(() => {
		async function checkUserRole() {
			try {
				const supabase = createClient();
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					setUserRole(null);
					setDebugInfo('No user logged in');
					setIsLoading(false);
					return;
				}

				setDebugInfo(`User ID: ${user.id}`);

				// Get user's role from the profiles table
				const { data: profile, error } = await supabase
					.from('profiles')
					.select('role')
					.eq('id', user.id)
					.single();

				if (error) {
					console.error('Error fetching profile:', error);
					setDebugInfo(`Error: ${error.message}`);
					setUserRole(null);
				} else {
					const role = profile?.role || UserRole.GUEST;
					setUserRole(role);
					setDebugInfo(`Role: ${role}`);
					console.log('AdminHeaderButton - User role:', role);
				}
			} catch (error) {
				console.error('Error checking user role:', error);
				setUserRole(null);
				setDebugInfo(`Catch error: ${error}`);
			} finally {
				setIsLoading(false);
			}
		}

		checkUserRole();
	}, []);

	// Debug mode - always show the button with debug info
	if (process.env.NODE_ENV === 'development') {
		return (
			<div className='flex items-center gap-2'>
				<Button
					asChild
					variant='outline'
					size='sm'
					className='gap-2'
				>
					<Link href='/dashboard/admin/role-monitoring'>
						<Shield className='h-4 w-4' />
						Admin ({isLoading ? 'Loading...' : debugInfo})
					</Link>
				</Button>
			</div>
		);
	}

	// Only show for SUPER_ADMIN and ADMIN users
	if (
		isLoading ||
		!userRole ||
		(userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN)
	) {
		return null;
	}

	return (
		<Button
			asChild
			variant='outline'
			size='sm'
			className='gap-2'
		>
			<Link href='/dashboard/admin/role-monitoring'>
				<Shield className='h-4 w-4' />
				Admin
			</Link>
		</Button>
	);
}
