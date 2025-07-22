/**
 * Development Info Component
 *
 * Shows development authentication instructions
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDevLoginInfo } from '@/app/actions/dev-auth';
import Link from 'next/link';

export function DevInfo() {
	const [devInfo, setDevInfo] = useState<{
		devMode: boolean;
		users: Array<{ email: string; given_name?: string; family_name?: string }>;
		instructions?: string;
	} | null>(null);

	useEffect(() => {
		getDevLoginInfo().then(setDevInfo);
	}, []);

	if (!devInfo?.devMode) {
		return null;
	}

	return (
		<Card className='w-full max-w-2xl border-orange-200 bg-orange-50'>
			<CardHeader>
				<CardTitle className='text-orange-800'>🚧 Development Mode</CardTitle>
				<div className='text-xs text-orange-700 mt-2'>
					<strong>Warning:</strong> This feature is for development only. Never
					enable in production!
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<p className='text-orange-700'>{devInfo.instructions}</p>

				<div className='space-y-2'>
					<h4 className='font-semibold text-orange-800'>
						Available Test Users ({devInfo.users.length}):
					</h4>
					{devInfo.users.map((user, index) => (
						<div
							key={index}
							className='flex items-center justify-between p-2 bg-white rounded border'
						>
							<span className='font-mono text-sm'>
								{user.email}{' '}
								{user.given_name && `(${user.given_name} ${user.family_name})`}
							</span>
							<Button
								asChild
								size='sm'
								variant='outline'
							>
								<Link href={`/login?email=${encodeURIComponent(user.email)}`}>
									Login
								</Link>
							</Button>
						</div>
					))}
				</div>

				<div className='text-sm text-orange-600'>
					<p>
						<strong>Instructions:</strong>
					</p>
					<ol className='list-decimal list-inside space-y-1 mt-2'>
						<li>Click &ldquo;Login&rdquo; next to 1992savg@gmail.com</li>
						<li>Check your email for the magic link</li>
						<li>Click the magic link to authenticate</li>
						<li>You&rsquo;ll be redirected to the dashboard</li>
						<li>The AdminHeaderMenu should appear in the header</li>
					</ol>
				</div>
			</CardContent>
		</Card>
	);
}
