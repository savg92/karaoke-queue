'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useAddAttendeeForm } from '../../hooks/useAddAttendeeForm';
import { PerformanceTypeSelector } from './PerformanceTypeSelector';
import { SingerNameFields } from './SingerNameFields';
import { SongDetailsFields } from './SongDetailsFields';
import { FormActions } from '@/components/ui/FormActions';

interface AddAttendeeFormProps {
	eventId: string;
	onSuccess?: () => void;
}

export function AddAttendeeForm({ eventId, onSuccess }: AddAttendeeFormProps) {
	const {
		form,
		performanceType,
		isSubmitting,
		isOpen,
		setIsOpen,
		handleSubmit,
	} = useAddAttendeeForm({ eventId, onSuccess });

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					size='sm'
				>
					<Plus className='w-4 h-4 mr-2' />
					Add Attendee
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Add Attendee Manually</DialogTitle>
					<DialogDescription>
						Manually add a new attendee to your karaoke event.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={handleSubmit}
						className='space-y-4'
					>
						<PerformanceTypeSelector control={form.control} />
						<SingerNameFields
							control={form.control}
							performanceType={performanceType}
						/>
						<SongDetailsFields control={form.control} />
						<FormActions
							variant='inline'
							isSubmitting={isSubmitting}
							submitText='Add Attendee'
							onCancel={() => setIsOpen(false)}
							showLoader={true}
						/>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
