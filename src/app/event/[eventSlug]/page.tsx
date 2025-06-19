import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SignupForm } from './components/SignupForm';

// This page displays the public sign-up form for a specific karaoke event.
// Users can sign up to sing at the event by providing their name, song details, and performance type.
export default async function EventSignupPage({
	params,
}: {
	params: Promise<{ eventSlug: string }>;
}) {
	const { eventSlug } = await params;

	// Fetch the event details using the slug from the URL.
	// This ensures the event exists and is public before showing the sign-up form.
	const event = await prisma.event.findUnique({
		where: { slug: eventSlug },
		select: {
			id: true,
			name: true,
			description: true,
			date: true,
		},
	});

	// If the event doesn't exist or is not public, show a 404 page.
	if (!event) {
		notFound();
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-2xl'>
			<div className='text-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
					{event.name}
				</h1>
				{event.description && (
					<p className='text-gray-600 dark:text-gray-400 mb-4'>
						{event.description}
					</p>
				)}
				<p className='text-sm text-gray-500 dark:text-gray-500'>
					Event date: {new Date(event.date).toLocaleString()}
				</p>
			</div>

			<SignupForm eventId={event.id} />
		</div>
	);
}
