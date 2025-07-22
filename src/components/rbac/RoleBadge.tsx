/**
 * Role Badge Component
 *
 * Displays the current user's role with appropriate styling
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Shield, Crown, User, Eye, Users } from 'lucide-react';
import { UserRole } from '@/lib/rbac/types-fixed';
import { useUserRole } from '@/lib/hooks/useRBAC';

interface RoleBadgeProps {
	eventId?: string;
	className?: string;
}

export function RoleBadge({ eventId, className }: RoleBadgeProps) {
	const { data: userRole, isLoading } = useUserRole(eventId);

	if (isLoading) {
		return (
			<Badge
				variant='outline'
				className={className}
			>
				Loading...
			</Badge>
		);
	}

	if (!userRole) {
		return (
			<Badge
				variant='outline'
				className={className}
			>
				Guest
			</Badge>
		);
	}

	const getRoleConfig = (role: UserRole) => {
		switch (role) {
			case UserRole.SUPER_ADMIN:
				return {
					label: 'Super Admin',
					variant: 'destructive' as const,
					icon: Crown,
				};
			case UserRole.ADMIN:
				return {
					label: 'Admin',
					variant: 'destructive' as const,
					icon: Shield,
				};
			case UserRole.HOST:
				return {
					label: 'Host',
					variant: 'default' as const,
					icon: User,
				};
			case UserRole.VIEWER:
				return {
					label: 'Viewer',
					variant: 'secondary' as const,
					icon: Eye,
				};
			case UserRole.GUEST:
				return {
					label: 'Guest',
					variant: 'outline' as const,
					icon: Users,
				};
			default:
				return {
					label: 'Unknown',
					variant: 'outline' as const,
					icon: Users,
				};
		}
	};

	const config = getRoleConfig(userRole.role as UserRole);
	const Icon = config.icon;

	return (
		<Badge
			variant={config.variant}
			className={`flex items-center gap-1 ${className}`}
		>
			<Icon className='h-3 w-3' />
			{config.label}
		</Badge>
	);
}
