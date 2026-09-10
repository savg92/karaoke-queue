'use client';

import { useState } from 'react';
import { signInWithGoogle } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function GoogleIcon() {
	return (
		<svg className='h-4 w-4' viewBox='0 0 24 24' aria-hidden='true'>
			<path
				fill='#4285F4'
				d='M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c0 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z'
			/>
			<path
				fill='#34A853'
				d='M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.4 7.5 24 12 24z'
			/>
			<path
				fill='#FBBC05'
				d='M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.7 0 10.3 0 12s.5 3.3 1.4 4.7l3.8-2.3z'
			/>
			<path
				fill='#EA4335'
				d='M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.6 1.4 6.8l3.8 2.9c.9-2.9 3.6-5 6.8-5z'
			/>
		</svg>
	);
}

export function GoogleButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		setIsLoading(true);
		try {
			const result = await signInWithGoogle();
			if (result.success && result.url) {
				window.location.href = result.url;
			} else {
				toast.error(result.error || 'Google sign-in is not available');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant='outline'
			className='w-full'
			onClick={handleClick}
			disabled={isLoading}
		>
			<GoogleIcon />
			{isLoading ? 'Redirecting...' : 'Sign in with Google'}
		</Button>
	);
}
