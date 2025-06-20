'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit2, Check, X } from 'lucide-react';
import { editSignup } from '@/app/actions/edit-signup';
import { toast } from 'sonner';
import type { QueueItem } from '../types';
import { SignupStatus, PerformanceType } from '@prisma/client';

interface AttendeesTableProps {
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

interface EditableRowProps {
	signup: QueueItem;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

function EditableRow({
	signup,
	onUpdateStatus,
	onRemoveSignup,
}: EditableRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
		singerName: signup.singerName,
		songTitle: signup.songTitle,
		artist: signup.artist,
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append('singerName', editData.singerName);
			formData.append('songTitle', editData.songTitle);
			formData.append('artist', editData.artist);

			const result = await editSignup(signup.id, formData);

			if (result.success) {
				toast.success(result.message);
				setIsEditing(false);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			console.error('Error saving signup:', error);
			toast.error('Failed to save changes');
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditData({
			singerName: signup.singerName,
			songTitle: signup.songTitle,
			artist: signup.artist,
		});
		setIsEditing(false);
	};

	return (
		<TableRow>
			{/* Singer Name */}
			<TableCell className='font-medium'>
				{isEditing ? (
					<Input
						value={editData.singerName}
						onChange={(e) =>
							setEditData({ ...editData, singerName: e.target.value })
						}
						className='h-8'
					/>
				) : (
					<button
						onClick={() => setIsEditing(true)}
						className='text-left hover:bg-muted p-1 rounded w-full'
					>
						{signup.singerName}
					</button>
				)}
			</TableCell>

			{/* Song Title */}
			<TableCell className='font-medium'>
				{isEditing ? (
					<Input
						value={editData.songTitle}
						onChange={(e) =>
							setEditData({ ...editData, songTitle: e.target.value })
						}
						className='h-8'
					/>
				) : (
					<button
						onClick={() => setIsEditing(true)}
						className='text-left hover:bg-muted p-1 rounded w-full'
					>
						{signup.songTitle}
					</button>
				)}
			</TableCell>

			{/* Artist */}
			<TableCell className='text-muted-foreground'>
				{isEditing ? (
					<Input
						value={editData.artist}
						onChange={(e) =>
							setEditData({ ...editData, artist: e.target.value })
						}
						className='h-8'
					/>
				) : (
					<button
						onClick={() => setIsEditing(true)}
						className='text-left hover:bg-muted p-1 rounded w-full text-muted-foreground'
					>
						{signup.artist}
					</button>
				)}
			</TableCell>

			{/* Performance Type */}
			<TableCell>
				<Badge variant='outline'>
					{performanceTypeConfig[signup.performanceType]}
				</Badge>
			</TableCell>

			{/* Status */}
			<TableCell>
				<Badge variant={statusConfig[signup.status].variant}>
					{statusConfig[signup.status].label}
				</Badge>
			</TableCell>

			{/* Queue Position */}
			<TableCell>
				{signup.status === SignupStatus.CANCELLED ? (
					<span className='text-muted-foreground'>-</span>
				) : (
					<Badge variant='secondary'>{signup.position}</Badge>
				)}
			</TableCell>

			{/* Signed Up */}
			<TableCell className='text-sm text-muted-foreground'>
				{new Date(signup.createdAt).toLocaleString()}
			</TableCell>

			{/* Performing Time */}
			<TableCell className='text-sm text-muted-foreground'>
				{signup.performingAt ? (
					new Date(signup.performingAt).toLocaleString()
				) : (
					<span className='text-muted-foreground'>-</span>
				)}
			</TableCell>

			{/* Actions */}
			<TableCell>
				{isEditing ? (
					<div className='flex gap-1'>
						<Button
							size='sm'
							onClick={handleSave}
							disabled={isSaving}
							className='h-8 w-8 p-0'
						>
							<Check className='h-4 w-4' />
						</Button>
						<Button
							size='sm'
							variant='outline'
							onClick={handleCancel}
							disabled={isSaving}
							className='h-8 w-8 p-0'
						>
							<X className='h-4 w-4' />
						</Button>
					</div>
				) : (
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
							<DropdownMenuItem onClick={() => setIsEditing(true)}>
								<Edit2 className='h-4 w-4 mr-2' />
								Edit Details
							</DropdownMenuItem>
							{/* Status transition actions */}
							{signup.status === SignupStatus.QUEUED && (
								<DropdownMenuItem
									onClick={() =>
										onUpdateStatus(signup.id, SignupStatus.PERFORMING)
									}
								>
									Mark as Performing
								</DropdownMenuItem>
							)}
							{signup.status === SignupStatus.PERFORMING && (
								<DropdownMenuItem
									onClick={() =>
										onUpdateStatus(signup.id, SignupStatus.COMPLETE)
									}
								>
									Mark as Complete
								</DropdownMenuItem>
							)}
							{(signup.status === SignupStatus.QUEUED ||
								signup.status === SignupStatus.PERFORMING) && (
								<DropdownMenuItem
									onClick={() =>
										onUpdateStatus(signup.id, SignupStatus.CANCELLED)
									}
								>
									Cancel
								</DropdownMenuItem>
							)}
							{signup.status === SignupStatus.CANCELLED && (
								<DropdownMenuItem
									onClick={() => onUpdateStatus(signup.id, SignupStatus.QUEUED)}
								>
									Restore to Queue
								</DropdownMenuItem>
							)}
							{signup.status === SignupStatus.COMPLETE && (
								<DropdownMenuItem
									onClick={() => onUpdateStatus(signup.id, SignupStatus.QUEUED)}
								>
									Move Back to Queue
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={() => onRemoveSignup(signup.id)}
								className='text-destructive'
							>
								Remove from Event
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</TableCell>
		</TableRow>
	);
}

export function AttendeesTable({
	signups,
	onUpdateStatus,
	onRemoveSignup,
}: AttendeesTableProps) {
	// Sort signups by creation date (first come, first served for attendee view)
	const sortedSignups = [...signups].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);

	if (signups.length === 0) {
		return (
			<div className='rounded-md border'>
				<div className='p-8 text-center'>
					<p className='text-muted-foreground'>
						No attendees have signed up for this event yet.
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
						<TableHead>Singer</TableHead>
						<TableHead>Song</TableHead>
						<TableHead>Artist</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Queue Position</TableHead>
						<TableHead>Signed Up</TableHead>
						<TableHead>Performing Time</TableHead>
						<TableHead className='w-[100px]'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedSignups.map((signup) => (
						<EditableRow
							key={signup.id}
							signup={signup}
							onUpdateStatus={onUpdateStatus}
							onRemoveSignup={onRemoveSignup}
						/>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
