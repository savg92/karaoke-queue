import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit2 } from 'lucide-react';
import { SignupStatus } from '@prisma/client';

interface ActionMenuProps {
	status: SignupStatus;
	signupId: string;
	onEdit: () => void;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

export function ActionMenu({
	status,
	signupId,
	onEdit,
	onUpdateStatus,
	onRemoveSignup,
}: ActionMenuProps) {
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
				<DropdownMenuItem onClick={onEdit}>
					<Edit2 className='h-4 w-4 mr-2' />
					Edit Details
				</DropdownMenuItem>

				{/* Status transition actions */}
				{status === SignupStatus.QUEUED && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.PERFORMING)}
					>
						Mark as Performing
					</DropdownMenuItem>
				)}
				{status === SignupStatus.PERFORMING && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.COMPLETE)}
					>
						Mark as Complete
					</DropdownMenuItem>
				)}
				{(status === SignupStatus.QUEUED ||
					status === SignupStatus.PERFORMING) && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.CANCELLED)}
					>
						Cancel
					</DropdownMenuItem>
				)}
				{status === SignupStatus.CANCELLED && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.QUEUED)}
					>
						Restore to Queue
					</DropdownMenuItem>
				)}
				{status === SignupStatus.COMPLETE && (
					<DropdownMenuItem
						onClick={() => onUpdateStatus(signupId, SignupStatus.QUEUED)}
					>
						Move Back to Queue
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={() => onRemoveSignup(signupId)}
					className='text-destructive'
				>
					Remove from Event
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
