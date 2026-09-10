import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

const HOST_FEATURES = [
	'Real-time queue management',
	'Track performance status',
	'Share event with QR codes',
	'YouTube integration',
];

const ATTENDEE_FEATURES = [
	'Quick song signup',
	'Solo, duet, or group options',
	'No account required',
	'Fair queue positioning',
];

function FeatureCard({
	title,
	description,
	features,
	dotClass,
}: {
	title: string;
	description: string;
	features: string[];
	dotClass: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className='space-y-2'>
				{features.map((feature) => (
					<div key={feature} className='flex items-center gap-2'>
						<div className={`h-2 w-2 rounded-full ${dotClass}`}></div>
						<span>{feature}</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

export function FeatureCards() {
	return (
		<div className='grid md:grid-cols-2 gap-8 mt-16'>
			<FeatureCard
				title='For Hosts'
				description='Manage your karaoke event with powerful tools'
				features={HOST_FEATURES}
				dotClass='bg-primary'
			/>
			<FeatureCard
				title='For Attendees'
				description='Easy signup process for karaoke participants'
				features={ATTENDEE_FEATURES}
				dotClass='bg-secondary'
			/>
		</div>
	);
}
