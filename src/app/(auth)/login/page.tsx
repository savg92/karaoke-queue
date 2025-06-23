'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginWithEmail } from '@/app/(auth)/login/actions';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';

// Schema for form validation
const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);

		try {
			const result = await loginWithEmail(data.email);

			if (result.success) {
				setEmailSent(true);
				toast.success('Magic link sent! Check your email.');
			} else {
				toast.error(result.error || 'Failed to send magic link');
			}
		} catch (error) {
			console.error('Login error:', error);
			toast.error('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950'>
				{/* Theme toggle */}
				<div className='absolute top-4 right-4'>
					<ThemeToggle />
				</div>
				<Card className='w-full max-w-sm'>
					<CardHeader className='text-center'>
						<CardTitle>Check Your Email</CardTitle>
						<CardDescription>
							We&apos;ve sent you a magic link to sign in. Click the link in
							your email to continue.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant='outline'
							className='w-full'
							onClick={() => setEmailSent(false)}
						>
							Send Another Link
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950'>
			{/* Theme toggle */}
			<div className='absolute top-4 right-4'>
				<ThemeToggle />
			</div>
			<Card className='w-full max-w-sm'>
				<CardHeader>
					<CardTitle>Host Login</CardTitle>
					<CardDescription>
						Enter your email to receive a magic link to sign in.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-4'
						>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='host@example.com'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type='submit'
								className='w-full'
								disabled={isLoading}
							>
								{isLoading ? 'Sending...' : 'Send Magic Link'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
