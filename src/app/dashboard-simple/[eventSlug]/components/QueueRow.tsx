import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
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

interface QueueRowProps {
	signup: Signup;
}

export function QueueRow({ signup }: QueueRowProps) {
	const getStatusVariant = (status: SignupStatus) => {
		switch (status) {
			case 'QUEUED':
				return 'secondary';
			case 'PERFORMING':
				return 'default';
			case 'COMPLETE':
				return 'outline';
			default:
				return 'destructive';
		}
	};

	return (
		<TableRow key={signup.id}>
			<TableCell className='font-medium'>{signup.position}</TableCell>
			<TableCell>{signup.singerName}</TableCell>
			<TableCell className='font-medium'>{signup.songTitle}</TableCell>
			<TableCell className='text-muted-foreground'>{signup.artist}</TableCell>
			<TableCell>
				<Badge variant='outline'>{signup.performanceType}</Badge>
			</TableCell>
			<TableCell>
				<Badge variant={getStatusVariant(signup.status)}>{signup.status}</Badge>
			</TableCell>
		</TableRow>
	);
}
