/**
 * Recent Events Section Component
 * Displays recent role-related activities
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import { getRoleAnalytics } from '@/app/actions/role-monitoring';
import type { RoleEvent, RoleEventType, UserRole } from '../types';
import { roleColors, eventTypeColors } from '../constants';
import { SafeDateFormat } from '../utils/DateUtils';

export function RecentEventsSection() {
	const { data: analytics, isLoading } = useQuery({
		queryKey: ['rbac', 'analytics'], // Use same cache key as AnalyticsSection
		queryFn: () => getRoleAnalytics(),
		staleTime: 5 * 60 * 1000, // 5 minutes (increased from 2 minutes)
		gcTime: 15 * 60 * 1000, // 15 minutes (increased from 5 minutes)
		refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes (decreased from 2 minutes)
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Role Events</CardTitle>
					<CardDescription>Loading recent activities...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8 text-gray-500'>
						<Activity className='h-8 w-8 mx-auto mb-2 animate-spin' />
						<p>Loading events...</p>
					</div>
				</CardContent>
			</Card>
		);
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
									<SafeDateFormat date={event.timestamp} />
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
