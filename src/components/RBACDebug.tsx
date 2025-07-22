'use client';

import {
	useUserRole,
	useProfileRole,
	useProfileRoleRBAC,
	useAllProfiles,
} from '@/lib/hooks/useRBAC';
import { useQuery } from '@tanstack/react-query';
import { debugAuth } from '@/app/actions/debug-auth';
import { testDatabaseAccess } from '@/app/actions/test-db';

export function RBACDebug() {
	const { data: userRole, isLoading, error } = useUserRole();
	const { data: debugData, isLoading: debugLoading } = useQuery({
		queryKey: ['debugAuth'],
		queryFn: debugAuth,
	});
	const { data: testData, isLoading: testLoading } = useQuery({
		queryKey: ['testDb'],
		queryFn: testDatabaseAccess,
	});
	const { data: profileRole, isLoading: profileRoleLoading } = useProfileRole();
	const { data: profileRoleRBAC, isLoading: profileRoleRBACLoading } =
		useProfileRoleRBAC();
	const { data: allProfiles, isLoading: allProfilesLoading } = useAllProfiles();

	return (
		<div className='space-y-4'>
			{/* Profile Table Role */}
			<div className='p-4 bg-orange-100 border border-orange-300 rounded'>
				<h3 className='font-semibold'>Profile Table Role</h3>
				{profileRoleLoading ? (
					<p>Loading profile.role...</p>
				) : (
					<p>
						<strong>profile.role:</strong> {profileRole || 'N/A'}
					</p>
				)}
			</div>

			{/* All Profiles Table (Admin Debug) */}
			<div className='p-4 bg-yellow-100 border border-yellow-300 rounded'>
				<h3 className='font-semibold'>All Profiles (Admin Debug)</h3>
				{allProfilesLoading ? (
					<p>Loading all profiles...</p>
				) : allProfiles && allProfiles.length > 0 ? (
					<table className='text-xs w-full'>
						<thead>
							<tr>
								<th className='text-left'>ID</th>
								<th className='text-left'>Email</th>
								<th className='text-left'>Role</th>
							</tr>
						</thead>
						<tbody>
							{allProfiles.map((profile: Record<string, unknown>) => (
								<tr key={profile.id as string}>
									<td className='pr-2'>{profile.id as string}</td>
									<td className='pr-2'>{profile.email as string}</td>
									<td className='pr-2'>{profile.role as string}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<p>No profiles found or insufficient permissions.</p>
				)}
			</div>

			{/* Database Access Test */}
			<div className='p-4 bg-purple-100 border border-purple-300 rounded'>
				<h3 className='font-semibold'>Database Access Test</h3>
				{testLoading ? (
					<p>Testing database access...</p>
				) : (
					<div className='space-y-2'>
						<p>
							<strong>Success:</strong> {testData?.success ? 'Yes' : 'No'}
						</p>
						<p>
							<strong>Step:</strong> {testData?.step}
						</p>
						{testData?.error && (
							<p className='text-red-600'>
								<strong>Error:</strong> {testData.error}
							</p>
						)}
						{testData?.user && (
							<p>
								<strong>User:</strong> {testData.user.email} ({testData.user.id}
								)
							</p>
						)}
						{testData?.foundProfile && (
							<p className='text-green-600'>
								<strong>Found Profile:</strong> {testData.foundProfile.email}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Original RBAC Hook Debug */}
			<div className='p-4 bg-blue-100 border border-blue-300 rounded'>
				<h3 className='font-semibold'>RBAC Hook Debug</h3>
				{isLoading ? (
					<p>Loading user role...</p>
				) : error ? (
					<p className='text-red-600'>Error: {error.message}</p>
				) : (
					<div>
						<p>User Role: {userRole?.role || 'No role'}</p>
						<p>User ID: {userRole?.userId || 'No user ID'}</p>
						<p>Permissions: {userRole?.permissions?.length || 0} permissions</p>
					</div>
				)}
			</div>

			{/* Detailed Auth Debug */}
			<div className='p-4 bg-green-100 border border-green-300 rounded'>
				<h3 className='font-semibold'>Detailed Auth Debug</h3>
				{debugLoading ? (
					<p>Loading debug data...</p>
				) : (
					<div className='space-y-2'>
						<p>
							<strong>Success:</strong> {debugData?.success ? 'Yes' : 'No'}
						</p>
						{debugData?.error && (
							<p className='text-red-600'>
								<strong>Error:</strong> {debugData.error}
							</p>
						)}
						{debugData?.user && (
							<div>
								<p>
									<strong>User:</strong> {debugData.user.email} (
									{debugData.user.id})
								</p>
							</div>
						)}
						{debugData?.profile && (
							<div>
								<p>
									<strong>Profile Found:</strong> Yes
								</p>
								<p>
									<strong>Profile ID:</strong> {debugData.profile.id}
								</p>
								<p>
									<strong>Profile Email:</strong> {debugData.profile.email}
								</p>
								<p>
									<strong>Profile Role (profile.role):</strong>{' '}
									{debugData.profile.role}
								</p>
							</div>
						)}
						{debugData?.roleAssignments && (
							<div>
								<p>
									<strong>Role Assignments:</strong>{' '}
									{debugData.roleAssignments.length}
								</p>
								{debugData.roleAssignments.map(
									(
										assignment: { role: string; scope: string },
										index: number
									) => (
										<div
											key={index}
											className='ml-4 text-sm'
										>
											<p>
												• {assignment.role} ({assignment.scope})
											</p>
										</div>
									)
								)}
							</div>
						)}
						<details>
							<summary>Full Debug Data</summary>
							<pre className='text-xs overflow-auto'>
								{JSON.stringify(debugData, null, 2)}
							</pre>
						</details>
					</div>
				)}
			</div>

			{/* Profile Table Role (RBAC Fallback) */}
			<div className='p-4 bg-red-100 border border-red-300 rounded'>
				<h3 className='font-semibold'>Profile Table Role (RBAC Fallback)</h3>
				{profileRoleRBACLoading ? (
					<p>Loading profile.role for RBAC...</p>
				) : (
					<p>
						<strong>profile.role (RBAC):</strong> {profileRoleRBAC}
					</p>
				)}
			</div>
		</div>
	);
}
