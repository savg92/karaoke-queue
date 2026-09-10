import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { NextEventCard } from './components/NextEventCard';
import { FeatureCards } from './components/FeatureCards';

// Refresh the next-event lookup regularly so newly created events appear
// without requiring a redeploy (page stays statically optimized).
export const revalidate = 60;

export default async function HomePage() {
	const nextEvent = await prisma.event.findFirst({
		where: { date: { gte: new Date() } },
		orderBy: { date: 'asc' },
	});

	const signupHref = nextEvent ? `/event/${nextEvent.slug}` : '/event/test-event';

	return (
		<div className='min-h-screen bg-background'>
			{/* Header with theme toggle */}
			<div className='absolute right-4 top-4'>
				<ThemeToggle />
			</div>

			<div className='container mx-auto px-4 py-16'>
				<div className='flex justify-center mb-8'>
					<Image
						src='/hot-mess.png'
						alt='Hot Mess Karaoke'
						width={290}
						height={296}
						priority
					/>
				</div>
				<div className='space-y-6 text-center'>
					<h1 className='text-5xl font-bold text-foreground'>
						Hot Mess Karaoke
					</h1>
					<p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
						The modern way to manage your karaoke night. Host events, manage
						queues, and let attendees sign up seamlessly.
					</p>

					{nextEvent ? (
						<NextEventCard
							name={nextEvent.name}
							date={nextEvent.date}
							description={nextEvent.description}
							slug={nextEvent.slug}
						/>
					) : null}

					<div className='flex justify-center gap-4'>
						<Button asChild size='lg'>
							<Link href={signupHref}>Sign Up to Sing</Link>
						</Button>
						<Button asChild variant='outline' size='lg'>
							<Link href='/login'>Host Dashboard</Link>
						</Button>
					</div>
				</div>

				<FeatureCards />
			</div>
		</div>
	);
}
