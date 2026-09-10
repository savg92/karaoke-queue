'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { resetPassword } from './actions';
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
import { MailCheck } from 'lucide-react';

const resetSchema = z.object({
	email: z.string().email('Please enter a valid email address.'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
	const [sent, setSent] = useState(false);

	const form = useForm<ResetFormData>({
		resolver: zodResolver(resetSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (data: ResetFormData) => {
		try {
			const result = await resetPassword(data.email);
			if (result.success) {
				setSent(true);
			} else {
				toast.error(result.error || 'Failed to send reset email');
			}
		} catch {
			toast.error('An unexpected error occurred');
		}
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950'>
			<div className='absolute top-4 right-4'>
				<ThemeToggle />
			</div>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>Reset Password</CardTitle>
					<CardDescription>
						Enter your email and we&apos;ll send you a reset link.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sent ? (
						<div className='flex flex-col items-center gap-4 text-center'>
							<MailCheck className='h-12 w-12 text-primary' />
							<p className='text-sm text-muted-foreground'>
								Check your email for a link to reset your password.
							</p>
							<Button variant='outline' asChild>
								<Link href='/login'>Back to login</Link>
							</Button>
						</div>
					) : (
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
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting
										? 'Sending...'
										: 'Send Reset Link'}
								</Button>
								<Button variant='ghost' className='w-full' asChild>
									<Link href='/login'>Back to login</Link>
								</Button>
							</form>
						</Form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
