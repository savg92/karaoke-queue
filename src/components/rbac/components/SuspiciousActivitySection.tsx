/**
 * Suspicious Activity Section Component
 * Monitors and displays security concerns
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
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { checkSuspiciousActivity } from '@/app/actions/role-monitoring';
import type { SuspiciousIP, EscalationAttempt } from '../types';
import { SafeDateFormat } from '../utils/DateUtils';

export function SuspiciousActivitySection() {
	const { data: suspiciousActivity, isLoading } = useQuery({
		queryKey: ['rbac', 'suspicious-activity'],
		queryFn: () => checkSuspiciousActivity(),
		staleTime: 5 * 60 * 1000, // 5 minutes (increased from 3 minutes)
		gcTime: 15 * 60 * 1000, // 15 minutes (increased from 6 minutes)
		refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes (decreased from 3 minutes)
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center space-x-2'>
						<AlertTriangle className='h-5 w-5 text-red-500' />
						<span>Suspicious Activity</span>
					</CardTitle>
					<CardDescription>Checking for security concerns...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8 text-gray-500'>
						<Shield className='h-8 w-8 mx-auto mb-2 animate-spin' />
						<p>Scanning for threats...</p>
					</div>
				</CardContent>
			</Card>
		);
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
											<span className='font-mono'>
												{ip.ipAddress || 'Unknown'}
											</span>
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
												<SafeDateFormat date={attempt.timestamp} />
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
