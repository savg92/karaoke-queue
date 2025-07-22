/**
 * Enhanced Role Monitoring Dashboard
 *
 * Real-time role analytics and monitoring using the profiles.role field
 * and role_events table for comprehensive audit tracking
 */

'use client';

import { useState, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	AlertTriangle,
	Shield,
	Users,
	Activity,
	CheckCircle,
	XCircle,
	TrendingUp,
	Settings,
} from 'lucide-react';
import {
	getRoleAnalytics,
	getAllUsersWithRoles,
	updateUserRole,
	checkSuspiciousActivity,
} from '@/app/actions/role-monitoring';
import { toast } from 'sonner';
import {
	AnalyticsCardsSkeleton,
	RoleDistributionSkeleton,
	UserTableSkeleton,
	RecentEventsSkeleton,
	SuspiciousActivitySkeleton,
} from './RoleMonitoringSkeleton';

// Types need to be defined here since we're avoiding imports
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'HOST' | 'VIEWER' | 'GUEST';
type RoleEventType =
	| 'ROLE_ASSIGNED'
	| 'ROLE_REVOKED'
	| 'PERMISSION_GRANTED'
	| 'PERMISSION_DENIED'
	| 'UNAUTHORIZED_ACCESS'
	| 'ROLE_ESCALATION_ATTEMPT';

interface User {
	id: string;
	email: string;
	givenName?: string | null;
	familyName?: string | null;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}

interface RoleEvent {
	id: string;
	eventType: RoleEventType;
	role: UserRole;
	success: boolean;
	timestamp: Date;
	ipAddress?: string;
	user: {
		email: string;
	};
}

interface SuspiciousIP {
	ipAddress: string;
	failedAttempts: number;
}

interface EscalationAttempt {
	id: string;
	timestamp: Date;
	user: {
		email: string;
	};
}

const roleColors = {
	SUPER_ADMIN: 'bg-red-100 text-red-800',
	ADMIN: 'bg-orange-100 text-orange-800',
	HOST: 'bg-blue-100 text-blue-800',
	VIEWER: 'bg-green-100 text-green-800',
	GUEST: 'bg-gray-100 text-gray-800',
};

const eventTypeColors = {
	ROLE_ASSIGNED: 'bg-green-100 text-green-800',
	ROLE_REVOKED: 'bg-red-100 text-red-800',
	PERMISSION_GRANTED: 'bg-blue-100 text-blue-800',
	PERMISSION_DENIED: 'bg-yellow-100 text-yellow-800',
	UNAUTHORIZED_ACCESS: 'bg-red-100 text-red-800',
	ROLE_ESCALATION_ATTEMPT: 'bg-purple-100 text-purple-800',
};

export function EnhancedRoleMonitoringDashboard() {
	return (
		<div className='p-6 space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Role Monitoring Dashboard</h1>
				<div className='flex items-center space-x-2'>
					<Shield className='h-6 w-6 text-blue-600' />
					<span className='text-sm text-gray-600'>
						Last updated: {new Date().toLocaleTimeString()}
					</span>
				</div>
			</div>

			{/* Progressive loading of sections */}
			<Suspense fallback={<AnalyticsCardsSkeleton />}>
				<AnalyticsSection />
			</Suspense>

			<Suspense fallback={<UserTableSkeleton />}>
				<UserManagementSection />
			</Suspense>

			<Suspense fallback={<RecentEventsSkeleton />}>
				<RecentEventsSection />
			</Suspense>

			<Suspense fallback={<SuspiciousActivitySkeleton />}>
				<SuspiciousActivitySection />
			</Suspense>
		</div>
	);
}

// Split into separate components for better performance
function AnalyticsSection() {
	const { data: analytics, isLoading } = useQuery({
		queryKey: ['role-analytics'],
		queryFn: () => getRoleAnalytics(),
		staleTime: 2 * 60 * 1000, // 2 minutes - cache longer since analytics don't change frequently
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes instead of 30 seconds
	});

	if (isLoading) {
		return (
			<>
				<AnalyticsCardsSkeleton />
				<RoleDistributionSkeleton />
			</>
		);
	}

	if (!analytics) return null;

	return (
		<>
			{/* Analytics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Events</CardTitle>
						<Activity className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{analytics.totalEvents}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Active Users</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{Object.values(
								analytics.roleDistribution as Record<string, number>
							).reduce((a, b) => a + b, 0)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Security Violations
						</CardTitle>
						<AlertTriangle className='h-4 w-4 text-red-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>
							{analytics.unauthorizedAttempts +
								analytics.roleEscalationAttempts}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Top Activity</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{analytics.topActiveUsers[0]?.eventCount || 0}
						</div>
						<p className='text-xs text-muted-foreground'>events by top user</p>
					</CardContent>
				</Card>
			</div>

			{/* Role Distribution */}
			<Card>
				<CardHeader>
					<CardTitle>Role Distribution</CardTitle>
					<CardDescription>Current distribution of user roles</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
						{Object.entries(
							analytics.roleDistribution as Record<string, number>
						).map(([role, count]) => (
							<div
								key={role}
								className='text-center'
							>
								<Badge className={roleColors[role as UserRole]}>
									{role.replace('_', ' ')}
								</Badge>
								<div className='text-2xl font-bold mt-2'>{count}</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);
}

function UserManagementSection() {
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [newRole, setNewRole] = useState<UserRole>('GUEST');
	const [reason, setReason] = useState('');
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

	const queryClient = useQueryClient();

	const { data: users, isLoading } = useQuery({
		queryKey: ['users-with-roles'],
		queryFn: () => getAllUsersWithRoles(),
		staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change often
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes instead of 1 minute
	});

	const updateRoleMutation = useMutation({
		mutationFn: ({
			userId,
			role,
			reason,
		}: {
			userId: string;
			role: UserRole;
			reason?: string;
		}) => updateUserRole(userId, role, reason),
		onSuccess: () => {
			toast.success('User role updated successfully');
			queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
			queryClient.invalidateQueries({ queryKey: ['role-analytics'] });
			setIsUpdateDialogOpen(false);
			setSelectedUser(null);
			setReason('');
		},
		onError: (error) => {
			toast.error(`Failed to update role: ${error.message}`);
		},
	});

	const handleUpdateRole = () => {
		if (!selectedUser) return;

		updateRoleMutation.mutate({
			userId: selectedUser.id,
			role: newRole,
			reason: reason.trim() || undefined,
		});
	};

	const formatUserName = (user: User) => {
		if (user.givenName && user.familyName) {
			return `${user.givenName} ${user.familyName}`;
		}
		return user.email;
	};

	if (isLoading) {
		return <UserTableSkeleton />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>User Management</CardTitle>
				<CardDescription>Manage user roles and permissions</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Current Role</TableHead>
							<TableHead>Created</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users?.map((user: User) => (
							<TableRow key={user.id}>
								<TableCell className='font-medium'>
									{formatUserName(user)}
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<Badge className={roleColors[user.role as UserRole]}>
										{user.role.replace('_', ' ')}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(user.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<Dialog
										open={isUpdateDialogOpen}
										onOpenChange={setIsUpdateDialogOpen}
									>
										<DialogTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												onClick={() => {
													setSelectedUser(user);
													setNewRole(user.role);
												}}
											>
												<Settings className='h-4 w-4 mr-1' />
												Edit Role
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Update User Role</DialogTitle>
												<DialogDescription>
													Change the role for {formatUserName(user)}
												</DialogDescription>
											</DialogHeader>
											<div className='space-y-4'>
												<div>
													<Label htmlFor='role'>New Role</Label>
													<Select
														value={newRole}
														onValueChange={(value) =>
															setNewRole(value as UserRole)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{(
																[
																	'SUPER_ADMIN',
																	'ADMIN',
																	'HOST',
																	'VIEWER',
																	'GUEST',
																] as UserRole[]
															).map((role) => (
																<SelectItem
																	key={role}
																	value={role}
																>
																	{role.replace('_', ' ')}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label htmlFor='reason'>Reason (optional)</Label>
													<Textarea
														id='reason'
														value={reason}
														onChange={(e) => setReason(e.target.value)}
														placeholder='Explain why this role change is needed...'
													/>
												</div>
												<div className='flex justify-end space-x-2'>
													<Button
														variant='outline'
														onClick={() => setIsUpdateDialogOpen(false)}
													>
														Cancel
													</Button>
													<Button
														onClick={handleUpdateRole}
														disabled={updateRoleMutation.isPending}
													>
														{updateRoleMutation.isPending
															? 'Updating...'
															: 'Update Role'}
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function RecentEventsSection() {
	const { data: analytics, isLoading } = useQuery({
		queryKey: ['role-analytics'],
		queryFn: () => getRoleAnalytics(),
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchInterval: 2 * 60 * 1000,
	});

	if (isLoading) {
		return <RecentEventsSkeleton />;
	}

	if (!analytics?.recentEvents?.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Role Events</CardTitle>
					<CardDescription>Latest role-related activities</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8 text-gray-500'>
						<Activity className='h-12 w-12 mx-auto mb-2' />
						<p>No recent events</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Role Events</CardTitle>
				<CardDescription>Latest role-related activities</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Event Type</TableHead>
							<TableHead>User</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Timestamp</TableHead>
							<TableHead>IP Address</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{analytics.recentEvents.slice(0, 10).map((event: RoleEvent) => (
							<TableRow key={event.id}>
								<TableCell>
									<Badge
										className={
											eventTypeColors[event.eventType as RoleEventType]
										}
									>
										{event.eventType.replace('_', ' ')}
									</Badge>
								</TableCell>
								<TableCell>{event.user.email}</TableCell>
								<TableCell>
									<Badge className={roleColors[event.role as UserRole]}>
										{event.role.replace('_', ' ')}
									</Badge>
								</TableCell>
								<TableCell>
									{event.success ? (
										<CheckCircle className='h-4 w-4 text-green-500' />
									) : (
										<XCircle className='h-4 w-4 text-red-500' />
									)}
								</TableCell>
								<TableCell>
									{new Date(event.timestamp).toLocaleString()}
								</TableCell>
								<TableCell className='font-mono text-sm'>
									{event.ipAddress || 'Unknown'}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function SuspiciousActivitySection() {
	const { data: suspiciousActivity, isLoading } = useQuery({
		queryKey: ['suspicious-activity'],
		queryFn: () => checkSuspiciousActivity(),
		staleTime: 3 * 60 * 1000, // 3 minutes
		gcTime: 6 * 60 * 1000, // 6 minutes
		refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes instead of 1 minute
	});

	if (isLoading) {
		return <SuspiciousActivitySkeleton />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center space-x-2'>
					<AlertTriangle className='h-5 w-5 text-red-500' />
					<span>Suspicious Activity</span>
				</CardTitle>
				<CardDescription>
					Recent security concerns that require attention
				</CardDescription>
			</CardHeader>
			<CardContent>
				{suspiciousActivity?.suspiciousIPs &&
					suspiciousActivity.suspiciousIPs.length > 0 && (
						<div className='mb-4'>
							<h4 className='font-semibold mb-2'>Suspicious IP Addresses</h4>
							<div className='space-y-2'>
								{suspiciousActivity.suspiciousIPs.map(
									(ip: SuspiciousIP, index: number) => (
										<div
											key={index}
											className='flex justify-between items-center p-2 bg-red-50 rounded'
										>
											<span className='font-mono'>{ip.ipAddress}</span>
											<Badge variant='destructive'>
												{ip.failedAttempts} failed attempts
											</Badge>
										</div>
									)
								)}
							</div>
						</div>
					)}

				{suspiciousActivity?.recentEscalationAttempts &&
					suspiciousActivity.recentEscalationAttempts.length > 0 && (
						<div>
							<h4 className='font-semibold mb-2'>Recent Escalation Attempts</h4>
							<div className='space-y-2'>
								{suspiciousActivity.recentEscalationAttempts.map(
									(attempt: EscalationAttempt) => (
										<div
											key={attempt.id}
											className='flex justify-between items-center p-2 bg-orange-50 rounded'
										>
											<span>{attempt.user.email}</span>
											<span className='text-sm text-gray-600'>
												{new Date(attempt.timestamp).toLocaleString()}
											</span>
										</div>
									)
								)}
							</div>
						</div>
					)}

				{!suspiciousActivity?.suspiciousIPs?.length &&
					!suspiciousActivity?.recentEscalationAttempts?.length && (
						<div className='text-center py-8 text-gray-500'>
							<CheckCircle className='h-12 w-12 mx-auto mb-2 text-green-500' />
							<p>No suspicious activity detected</p>
						</div>
					)}
			</CardContent>
		</Card>
	);
}
