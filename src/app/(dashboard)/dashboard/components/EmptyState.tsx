import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
	return (
		<Card>
			<CardHeader className='text-center'>
				<CardTitle>No Events Yet</CardTitle>
				<CardDescription>
					Create your first karaoke event to get started!
				</CardDescription>
			</CardHeader>
			<CardContent className='text-center'>
				<Button asChild>
					<Link href='/dashboard/create-event'>
						<Plus className='mr-2 h-4 w-4' />
						Create Your First Event
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
