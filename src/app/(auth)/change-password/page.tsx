'use client';

import Link from 'next/link';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ChangePasswordForm } from './components/ChangePasswordForm';

export default function ChangePasswordPage() {
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950'>
			<div className='absolute top-4 right-4'>
				<ThemeToggle />
			</div>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>Change Password</CardTitle>
					<CardDescription>
						Coming from the email link? Leave the current password blank.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChangePasswordForm />
					<Button variant='ghost' className='w-full mt-4' asChild>
						<Link href='/dashboard'>Back to dashboard</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
