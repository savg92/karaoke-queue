'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Play, CheckCircle, X } from 'lucide-react';
import type { QueueItem } from '../types';
import { SignupStatus, PerformanceType } from '@prisma/client';

interface QueueTableProps {
	signups: QueueItem[];
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

const statusConfig = {
	[SignupStatus.QUEUED]: {
		label: 'Queued',
		variant: 'secondary' as const,
		color: 'bg-blue-100 text-blue-800',
	},
	[SignupStatus.PERFORMING]: {
		label: 'Performing',
		variant: 'default' as const,
		color: 'bg-green-100 text-green-800',
	},
	[SignupStatus.COMPLETE]: {
		label: 'Complete',
		variant: 'outline' as const,
		color: 'bg-gray-100 text-gray-800',
	},
	[SignupStatus.CANCELLED]: {
		label: 'Cancelled',
		variant: 'destructive' as const,
		color: 'bg-red-100 text-red-800',
	},
};

const performanceTypeConfig = {
	[PerformanceType.SOLO]: 'Solo',
	[PerformanceType.DUET]: 'Duet',
	[PerformanceType.GROUP]: 'Group',
};

export function QueueTable({
	signups,
	onUpdateStatus,
	onRemoveSignup,
}: QueueTableProps) {
	if (signups.length === 0) {
		return (
			<div className='rounded-md border'>
				<div className='p-8 text-center'>
					<p className='text-muted-foreground'>
						No signups yet. Share your event link to get started!
					</p>
				</div>
			</div>
		);
	}

	return (
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
						<TableHead className='w-[50px]'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{signups.map((signup) => (
						<TableRow key={signup.id}>
							<TableCell className='font-medium'>{signup.position}</TableCell>
							<TableCell>{signup.singerName}</TableCell>
							<TableCell className='font-medium'>{signup.songTitle}</TableCell>
							<TableCell className='text-muted-foreground'>
								{signup.artist}
							</TableCell>
							<TableCell>
								<Badge variant='outline'>
									{performanceTypeConfig[signup.performanceType]}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge variant={statusConfig[signup.status].variant}>
									{statusConfig[signup.status].label}
								</Badge>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant='ghost'
											className='h-8 w-8 p-0'
										>
											<span className='sr-only'>Open menu</span>
											<MoreHorizontal className='h-4 w-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										{signup.status === SignupStatus.QUEUED && (
											<DropdownMenuItem
												onClick={() =>
													onUpdateStatus(signup.id, SignupStatus.PERFORMING)
												}
											>
												<Play className='mr-2 h-4 w-4' />
												Mark as Performing
											</DropdownMenuItem>
										)}
										{signup.status === SignupStatus.PERFORMING && (
											<DropdownMenuItem
												onClick={() =>
													onUpdateStatus(signup.id, SignupStatus.COMPLETE)
												}
											>
												<CheckCircle className='mr-2 h-4 w-4' />
												Mark as Complete
											</DropdownMenuItem>
										)}
										{signup.status !== SignupStatus.CANCELLED && (
											<DropdownMenuItem
												onClick={() =>
													onUpdateStatus(signup.id, SignupStatus.CANCELLED)
												}
												className='text-red-600'
											>
												<X className='mr-2 h-4 w-4' />
												Cancel
											</DropdownMenuItem>
										)}
										<DropdownMenuItem
											onClick={() => onRemoveSignup(signup.id)}
											className='text-red-600'
										>
											<X className='mr-2 h-4 w-4' />
											Remove
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
