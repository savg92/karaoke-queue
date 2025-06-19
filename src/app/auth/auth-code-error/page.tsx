import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AuthCodeErrorPageProps {
	searchParams: Promise<{ error?: string; description?: string }>;
}

export default async function AuthCodeErrorPage({
	searchParams,
}: AuthCodeErrorPageProps) {
	const params = await searchParams;
	const error = params.error;
	const description = params.description;

	const getErrorMessage = (errorCode?: string) => {
		switch (errorCode) {
			case 'otp_expired':
				return 'Your magic link has expired. Please request a new one.';
			case 'access_denied':
				return 'Access was denied. The link may have been used already.';
			case 'exchange_failed':
				return 'Failed to authenticate. Please try logging in again.';
			case 'no_code':
				return 'No authentication code was received.';
			default:
				return 'There was an unexpected error during authentication.';
		}
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950'>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<div className='flex justify-center mb-2'>
						<AlertCircle className='h-12 w-12 text-red-500' />
					</div>
					<CardTitle>Authentication Error</CardTitle>
					<CardDescription>{getErrorMessage(error)}</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					{description && (
						<div className='p-3 bg-red-50 border border-red-200 rounded-md'>
							<p className='text-sm text-red-700'>{description}</p>
						</div>
					)}

					<div className='text-sm text-muted-foreground'>
						<p className='mb-2'>This could happen if:</p>
						<ul className='list-disc list-inside space-y-1'>
							<li>The magic link has expired (links expire after 1 hour)</li>
							<li>The link has already been used</li>
							<li>There was a network error</li>
							<li>The link was opened in a different browser</li>
						</ul>
					</div>

					<div className='flex flex-col gap-2'>
						<Button asChild>
							<Link href='/login'>
								<RefreshCw className='mr-2 h-4 w-4' />
								Request New Link
							</Link>
						</Button>
						<Button
							variant='outline'
							asChild
						>
							<Link href='/'>Go Home</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
