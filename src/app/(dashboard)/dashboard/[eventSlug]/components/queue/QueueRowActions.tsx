'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Play, CheckCircle, X } from 'lucide-react';
import { SignupStatus } from '@prisma/client';

interface QueueRowActionsProps {
	signupId: string;
	status: SignupStatus;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

export function QueueRowActions({
	signupId,
	status,
	onUpdateStatus,
	onRemoveSignup,
}: QueueRowActionsProps) {
	return (
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
				{status === SignupStatus.QUEUED && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.PERFORMING)}
					>
						<Play className='mr-2 h-4 w-4' />
						Mark as Performing
					</DropdownMenuItem>
				)}
				{status === SignupStatus.PERFORMING && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.COMPLETE)}
					>
						<CheckCircle className='mr-2 h-4 w-4' />
						Mark as Complete
					</DropdownMenuItem>
				)}
				{status !== SignupStatus.CANCELLED && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.CANCELLED)}
						className='text-red-600'
					>
						<X className='mr-2 h-4 w-4' />
						Cancel
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={() => onRemoveSignup(signupId)}
					className='text-red-600'
				>
					<X className='mr-2 h-4 w-4' />
					Remove
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
