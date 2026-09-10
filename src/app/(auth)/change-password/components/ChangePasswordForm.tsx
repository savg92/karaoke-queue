'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updatePassword } from '../actions';
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

const changeSchema = z
	.object({
		currentPassword: z.string().optional(),
		newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

type ChangeFormData = z.infer<typeof changeSchema>;

export function ChangePasswordForm() {
	const router = useRouter();

	const form = useForm<ChangeFormData>({
		resolver: zodResolver(changeSchema),
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
	});

	const onSubmit = async (data: ChangeFormData) => {
		try {
			const result = await updatePassword(
				data.newPassword,
				data.currentPassword || undefined
			);
			if (result.success) {
				toast.success('Password updated successfully!');
				router.push('/dashboard');
			} else {
				toast.error(result.error || 'Failed to update password');
			}
		} catch {
			toast.error('An unexpected error occurred');
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				<FormField
					control={form.control}
					name='currentPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Current password (optional)</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='••••••••'
									autoComplete='current-password'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='newPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>New password</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='••••••••'
									autoComplete='new-password'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='confirmPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm new password</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='••••••••'
									autoComplete='new-password'
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
					{form.formState.isSubmitting ? 'Updating...' : 'Update Password'}
				</Button>
			</form>
		</Form>
	);
}
