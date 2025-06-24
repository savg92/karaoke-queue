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
		<div className="min-h-screen bg-background">
			{/* Header with theme toggle */}
			<div className="absolute right-4 top-4">
				<ThemeToggle />
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="space-y-6 text-center">
					<h1 className="text-5xl font-bold text-foreground">
						Karaoke Queue
					</h1>
					<p className="mx-auto max-w-2xl text-xl text-muted-foreground">
						The modern way to manage your karaoke night. Host events, manage
						queues, and let attendees sign up seamlessly.
					</p>

					<div className="flex justify-center gap-4">
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

				<div className="grid md:grid-cols-2 gap-8 mt-16">
					<Card>
						<CardHeader>
							<CardTitle>For Hosts</CardTitle>
							<CardDescription>
								Manage your karaoke event with powerful tools
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary"></div>
								<span>Real-time queue management</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary"></div>
								<span>Track performance status</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary"></div>
								<span>Share event with QR codes</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary"></div>
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
						<CardContent className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-secondary"></div>
								<span>Quick song signup</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-secondary"></div>
								<span>Solo, duet, or group options</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-secondary"></div>
								<span>No account required</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-secondary"></div>
								<span>Fair queue positioning</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
