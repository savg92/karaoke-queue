'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginWithEmail } from '@/app/(auth)/login/actions';
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

const magicLinkSchema = z.object({
	email: z.string().email('Please enter a valid email address.'),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

export function MagicLinkForm({ onSuccess }: { onSuccess: () => void }) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<MagicLinkFormData>({
		resolver: zodResolver(magicLinkSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (data: MagicLinkFormData) => {
		setIsLoading(true);
		try {
			const result = await loginWithEmail(data.email);
			if (result.success) {
				onSuccess();
			} else {
				toast.error(result.error || 'Failed to send magic link');
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
				<Button type='submit' className='w-full' disabled={isLoading}>
					{isLoading ? 'Sending...' : 'Send Magic Link'}
				</Button>
			</form>
		</Form>
	);
}
