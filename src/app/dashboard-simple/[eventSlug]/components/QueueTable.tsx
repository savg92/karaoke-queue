import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { QueueRow } from './QueueRow';
import { SignupStatus, PerformanceType } from '@prisma/client';

interface Signup {
	id: string;
	position: number;
	singerName: string;
	songTitle: string;
	artist: string;
	performanceType: PerformanceType;
	status: SignupStatus;
}

interface QueueTableProps {
	eventName: string;
	signups: Signup[];
}

export function QueueTable({ eventName, signups }: QueueTableProps) {
	if (signups.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Karaoke Queue</CardTitle>
					<CardDescription>Current queue for {eventName}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8'>
						<p className='text-muted-foreground'>
							No signups yet. Share your event link to get started!
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Karaoke Queue</CardTitle>
				<CardDescription>Current queue for {eventName}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[80px]'>Position</TableHead>
								<TableHead>Singer</TableHead>
								<TableHead>Song</TableHead>
								<TableHead>Artist</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{signups.map((signup) => (
								<QueueRow
									key={signup.id}
									signup={signup}
								/>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
