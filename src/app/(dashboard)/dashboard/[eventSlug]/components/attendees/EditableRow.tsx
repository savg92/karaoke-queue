import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SignupStatus } from '@prisma/client';
import type { QueueItem } from '../../types';
import { useEditableRow } from '../../hooks/useEditableRow';
import { ActionMenu } from '../queue/ActionMenu';
import { FormActions } from '@/components/ui/FormActions';
import {
	statusConfig,
	performanceTypeConfig,
} from '../../constants/signup-config';

interface EditableRowProps {
	signup: QueueItem;
	onUpdateStatus: (signupId: string, status: SignupStatus) => void;
	onRemoveSignup: (signupId: string) => void;
}

export function EditableRow({
	signup,
	onUpdateStatus,
	onRemoveSignup,
}: EditableRowProps) {
	const {
		isEditing,
		editData,
		isSaving,
		startEditing,
		cancelEditing,
		updateField,
		saveChanges,
	} = useEditableRow({
		singerName: signup.singerName,
		songTitle: signup.songTitle,
		artist: signup.artist,
	});

	const handleSave = () => {
		saveChanges(signup.id);
	};

	return (
		<TableRow>
			{/* Singer Name */}
			<TableCell className='font-medium'>
				{isEditing ? (
					<Input
						value={editData.singerName}
						onChange={(e) => updateField('singerName', e.target.value)}
						className='h-8'
					/>
				) : (
					<button
						onClick={startEditing}
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
						onChange={(e) => updateField('songTitle', e.target.value)}
						className='h-8'
					/>
				) : (
					<button
						onClick={startEditing}
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
						onChange={(e) => updateField('artist', e.target.value)}
						className='h-8'
					/>
				) : (
					<button
						onClick={startEditing}
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
					<FormActions
						variant='compact'
						isSaving={isSaving}
						onSubmit={handleSave}
						onCancel={cancelEditing}
						showLoader={false}
					/>
				) : (
					<ActionMenu
						status={signup.status}
						signupId={signup.id}
						onEdit={startEditing}
						onUpdateStatus={onUpdateStatus}
						onRemoveSignup={onRemoveSignup}
					/>
				)}
			</TableCell>
		</TableRow>
	);
}
