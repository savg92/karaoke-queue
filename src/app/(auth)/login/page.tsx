'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginWithEmail } from '@/app/(auth)/login/actions';
import {
	signInWithPassword,
	signInWithGoogle,
} from '@/app/actions/auth';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';
import Link from 'next/link';
import { MagicLinkSent } from './components/MagicLinkSent';
import { MagicLinkForm } from './components/MagicLinkForm';
import { PasswordForm } from './components/PasswordForm';
import { GoogleButton } from './components/GoogleButton';

export default function LoginPage() {
	const [emailSent, setEmailSent] = useState(false);

	if (emailSent) {
		return (
			<LoginShell>
				<MagicLinkSent onResend={() => setEmailSent(false)} />
			</LoginShell>
		);
	}

	return (
		<LoginShell>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>Host Login</CardTitle>
					<CardDescription>
						Sign in to manage your karaoke events.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue='password' className='w-full'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='password'>Password</TabsTrigger>
							<TabsTrigger value='magic-link'>Magic Link</TabsTrigger>
						</TabsList>

						<TabsContent value='password' className='mt-4'>
							<PasswordForm />
						</TabsContent>

						<TabsContent value='magic-link' className='mt-4'>
							<MagicLinkForm onSuccess={() => setEmailSent(true)} />
						</TabsContent>
					</Tabs>

					<div className='relative my-6'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-card px-2 text-muted-foreground'>
								Or continue with
							</span>
						</div>
					</div>

					<GoogleButton />
				</CardContent>
			</Card>
		</LoginShell>
	);
}

function LoginShell({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950'>
			<div className='absolute top-4 right-4'>
				<ThemeToggle />
			</div>
			{children}
		</div>
	);
}
