import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default function HomePage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
			{/* Header with theme toggle */}
			<div className='absolute top-4 right-4'>
				<ThemeToggle />
			</div>

			<div className='container mx-auto px-4 py-16'>
				<div className='text-center space-y-6'>
					<h1 className='text-5xl font-bold text-gray-900 dark:text-white'>
						Karaoke Queue
					</h1>
					<p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
						The modern way to manage your karaoke night. Host events, manage
						queues, and let attendees sign up seamlessly.
					</p>

					<div className='flex gap-4 justify-center'>
						<Button
							asChild
							size='lg'
						>
							<Link href='/login'>Host an Event</Link>
						</Button>
						<Button
							asChild
							variant='outline'
							size='lg'
						>
							<Link href='/event/test-event'>Join Test Event</Link>
						</Button>
					</div>
				</div>

				<div className='grid md:grid-cols-2 gap-8 mt-16'>
					<Card>
						<CardHeader>
							<CardTitle>For Hosts</CardTitle>
							<CardDescription>
								Manage your karaoke event with powerful tools
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-2'>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span>Real-time queue management</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span>Track performance status</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span>Share event with QR codes</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span>YouTube integration</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>For Attendees</CardTitle>
							<CardDescription>
								Easy signup process for karaoke participants
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-2'>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
								<span>Quick song signup</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
								<span>Solo, duet, or group options</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
								<span>No account required</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
								<span>Fair queue positioning</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
