/**
 * User Management Section Component
 * Handles user role management and updates
 */

'use client';

import { useState } from 'react';
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
import { Users, Settings } from 'lucide-react';
import {
	getAllUsersWithRoles,
	updateUserRole,
} from '@/app/actions/role-monitoring';
import { toast } from 'sonner';
import type { UserRole } from '../types';
import { roleColors, USER_ROLES } from '../constants';
import { SafeDateFormat } from '../utils/DateUtils';

// Type for user data returned from getAllUsersWithRoles
type UserWithRole = {
	id: string;
	email: string;
	givenName: string | null;
	familyName: string | null;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
};

export function UserManagementSection() {
	const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
	const [newRole, setNewRole] = useState<UserRole>('GUEST');
	const [reason, setReason] = useState('');
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

	const queryClient = useQueryClient();

	const { data: users, isLoading } = useQuery({
		queryKey: ['rbac', 'users'],
		queryFn: () => getAllUsersWithRoles(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes (increased from 10 minutes)
		refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes (increased from 5 minutes)
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
			queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
			queryClient.invalidateQueries({ queryKey: ['rbac', 'analytics'] });
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

	const formatUserName = (user: UserWithRole) => {
		if (user.givenName && user.familyName) {
			return `${user.givenName} ${user.familyName}`;
		}
		return user.email;
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>User Management</CardTitle>
					<CardDescription>Loading user data...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8 text-gray-500'>
						<Users className='h-8 w-8 mx-auto mb-2 animate-spin' />
						<p>Loading users...</p>
					</div>
				</CardContent>
			</Card>
		);
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
						{users?.map((user: UserWithRole) => (
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
									<SafeDateFormat
										date={user.createdAt}
										format='date'
									/>
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
															{USER_ROLES.map((role) => (
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
