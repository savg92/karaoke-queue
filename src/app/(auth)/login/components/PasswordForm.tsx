'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithPassword } from '@/app/actions/auth';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

const passwordSchema = z.object({
	email: z.string().email('Please enter a valid email address.'),
	password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordForm() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const form = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
		defaultValues: { email: '', password: '' },
	});

	const onSubmit = async (data: PasswordFormData) => {
		setIsLoading(true);
		try {
			const result = await signInWithPassword(data.email, data.password);
			if (result.success) {
				toast.success('Signed in successfully!');
				router.push('/dashboard');
			} else {
				toast.error(result.error || 'Login failed');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type='email' placeholder='host@example.com' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem>
							<div className='flex items-center justify-between'>
								<FormLabel>Password</FormLabel>
								<Link
									href='/reset-password'
									className='text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline'
								>
									Forgot password?
								</Link>
							</div>
							<FormControl>
								<Input type='password' placeholder='••••••••' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit' className='w-full' disabled={isLoading}>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>
		</Form>
	);
}
