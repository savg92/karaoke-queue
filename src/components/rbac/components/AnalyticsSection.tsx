/**
 * Analytics Section Component
 * Displays role analytics cards and distribution charts
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Activity, TrendingUp } from 'lucide-react';
import { getRoleAnalytics } from '@/app/actions/role-monitoring';
import { roleColors } from '../constants';
import { UserRole } from '../types';

export function AnalyticsSection() {
	const { data: analytics, isLoading } = useQuery({
		queryKey: ['rbac', 'analytics'],
		queryFn: () => getRoleAnalytics(),
		staleTime: 5 * 60 * 1000, // 5 minutes (increased from 2 minutes)
		gcTime: 15 * 60 * 1000, // 15 minutes (increased from 5 minutes)
		refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes (decreased from 2 minutes)
	});

	if (isLoading) {
		return (
			<>
				{/* Simple loading cards without complex skeleton components */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Loading...
								</CardTitle>
								<Activity className='h-4 w-4 text-muted-foreground animate-pulse' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-gray-400'>--</div>
							</CardContent>
						</Card>
					))}
				</div>
				<Card>
					<CardHeader>
						<CardTitle>Role Distribution</CardTitle>
						<CardDescription>Loading role distribution...</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-center py-8 text-gray-500'>
							<Activity className='h-8 w-8 mx-auto mb-2 animate-spin' />
							<p>Loading data...</p>
						</div>
					</CardContent>
				</Card>
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
