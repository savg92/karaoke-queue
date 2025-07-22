/**
 * Debug RBAC Component
 *
 * Shows debugging information about current user authentication and roles
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { debugCurrentUser } from '@/app/actions/debug-rbac';

export function DebugRBAC() {
	type RoleAssignment = {
		role: string;
		scope: string;
		is_active: boolean;
		[key: string]: unknown;
	};
	const [debugInfo, setDebugInfo] = useState<{
		success: boolean;
		error: string | null;
		user: { email?: string; id: string } | null;
		profile: Record<string, unknown> | null;
		roleAssignments: RoleAssignment[];
	} | null>(null);
	const [loading, setLoading] = useState(false);

	const handleDebug = async () => {
		setLoading(true);
		try {
			const result = await debugCurrentUser();
			setDebugInfo(result);
		} catch (error) {
			setDebugInfo({
				success: false,
				error: 'Client error: ' + (error as Error).message,
				user: null,
				profile: null,
				roleAssignments: [],
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className='w-full max-w-2xl'>
			<CardHeader>
				<CardTitle>RBAC Debug Information</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<Button
					onClick={handleDebug}
					disabled={loading}
				>
					{loading ? 'Loading...' : 'Debug Current User'}
				</Button>

				{debugInfo && (
					<div className='space-y-4'>
						<div>
							<strong>Success:</strong> {debugInfo.success ? 'Yes' : 'No'}
						</div>

						{debugInfo.error && (
							<div className='text-red-600'>
								<strong>Error:</strong> {debugInfo.error}
							</div>
						)}

						{debugInfo.user && (
							<div>
								<strong>User:</strong>
								<pre className='bg-gray-100 p-2 rounded text-sm'>
									{JSON.stringify(debugInfo.user, null, 2)}
								</pre>
							</div>
						)}

						{debugInfo.profile && (
							<div>
								<strong>Profile:</strong>
								<pre className='bg-gray-100 p-2 rounded text-sm'>
									{JSON.stringify(debugInfo.profile, null, 2)}
								</pre>
							</div>
						)}

						<div>
							<strong>
								Role Assignments ({debugInfo.roleAssignments?.length || 0}):
							</strong>
							<pre className='bg-gray-100 p-2 rounded text-sm'>
								{JSON.stringify(debugInfo.roleAssignments, null, 2)}
							</pre>
							{debugInfo.roleAssignments &&
								debugInfo.roleAssignments.length > 0 && (
									<table className='text-xs w-full mt-2 border'>
										<thead>
											<tr>
												<th className='text-left'>Role</th>
												<th className='text-left'>Scope</th>
												<th className='text-left'>Active</th>
											</tr>
										</thead>
										<tbody>
											{debugInfo.roleAssignments.map(
												(assignment: RoleAssignment, idx: number) => (
													<tr key={idx}>
														<td className='pr-2'>{assignment.role}</td>
														<td className='pr-2'>{assignment.scope}</td>
														<td className='pr-2'>
															{assignment.is_active ? 'Yes' : 'No'}
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
