/**
 * Enhanced Role-Based Access Control (RBAC) Monitoring Dashboard
 * Modular dashboard with optimized performance and security monitoring
 */

'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AnalyticsSection } from './components/AnalyticsSection';
import { UserManagementSection } from './components/UserManagementSection';
import { RecentEventsSection } from './components/RecentEventsSection';
import { SuspiciousActivitySection } from './components/SuspiciousActivitySection';

export function EnhancedRoleMonitoringDashboard() {
	const queryClient = useQueryClient();

	// Export security report
	const handleExportReport = useCallback(async () => {
		try {
			// Generate a simple security report from available data
			const timestamp = new Date().toISOString();
			const report = {
				timestamp,
				title: 'Security Report',
				generated: 'RBAC Dashboard',
				message:
					'Report functionality will be implemented with backend integration',
			};

			const blob = new Blob([JSON.stringify(report, null, 2)], {
				type: 'application/json',
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `security-report-${
				new Date().toISOString().split('T')[0]
			}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success('Security report exported successfully');
		} catch (err) {
			console.error('Export failed:', err);
			toast.error('Failed to export security report');
		}
	}, []);

	return (
		<div className='space-y-6 p-6'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						Role Management Dashboard
					</h1>
					<p className='text-muted-foreground'>
						Monitor user roles, track changes, and maintain security across the
						system
					</p>
				</div>
				<div className='flex space-x-2'>
					<Button
						variant='outline'
						onClick={() => {
							queryClient.invalidateQueries();
							toast.success('Dashboard refreshed');
						}}
						className='flex items-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-150'
					>
						<RefreshCw className='h-4 w-4 mr-2' />
						Refresh
					</Button>
					<Button onClick={handleExportReport}>
						<Download className='h-4 w-4 mr-2' />
						Export Report
					</Button>
				</div>
			</div>

			{/* Modular Sections */}
			<AnalyticsSection />
			<UserManagementSection />
			<RecentEventsSection />
			<SuspiciousActivitySection />
		</div>
	);
}
