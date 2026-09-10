import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { CalendarDays, MapPin, Clock } from 'lucide-react';

type NextEventCardProps = {
	name: string;
	date: Date;
	description: string | null;
	slug: string;
};

export function NextEventCard({
	name,
	date,
	description,
	slug,
}: NextEventCardProps) {
	const href = `/event/${slug}`;

	return (
		<Card className='mx-auto max-w-2xl border-primary text-left'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<span aria-hidden='true'>🎤</span> {name}
				</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className='space-y-2 text-sm'>
				<div className='flex items-center gap-2'>
					<CalendarDays className='h-4 w-4 text-primary' />
					<span>
						{date.toLocaleDateString(undefined, {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
						})}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<Clock className='h-4 w-4 text-primary' />
					<span>
						{date.toLocaleTimeString(undefined, {
							hour: 'numeric',
							minute: '2-digit',
						})}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<MapPin className='h-4 w-4 text-primary' />
					<Link
						href={href}
						className='underline underline-offset-4 hover:text-primary'
					>
						View event details & sign up
					</Link>
				</div>
				<Button asChild className='mt-2'>
					<Link href={href}>Sign Up to Sing</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
