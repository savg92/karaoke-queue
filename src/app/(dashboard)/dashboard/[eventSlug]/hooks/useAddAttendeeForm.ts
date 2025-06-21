import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	addAttendeeSchema,
	type AddAttendeeFormData,
	addAttendeeDefaults,
} from '@/lib/validators/add-attendee';
import { addSinger } from '@/app/actions/add-singer';
import { toast } from 'sonner';

export interface UseAddAttendeeFormProps {
	eventId: string;
	onSuccess?: () => void;
}

export function useAddAttendeeForm({
	eventId,
	onSuccess,
}: UseAddAttendeeFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const form = useForm<AddAttendeeFormData>({
		resolver: zodResolver(addAttendeeSchema),
		defaultValues: addAttendeeDefaults,
	});

	const performanceType = form.watch('performanceType');

	const handleSubmit = async (data: AddAttendeeFormData) => {
		setIsSubmitting(true);
		try {
			// Create FormData to match the existing server action
			const formData = new FormData();
			formData.append('performanceType', data.performanceType);

			// Only append non-empty string values
			if (data.singerName?.trim()) {
				formData.append('singerName', data.singerName.trim());
			}
			if (data.singerName1?.trim()) {
				formData.append('singerName1', data.singerName1.trim());
			}
			if (data.singerName2?.trim()) {
				formData.append('singerName2', data.singerName2.trim());
			}
			if (data.singerName3?.trim()) {
				formData.append('singerName3', data.singerName3.trim());
			}
			if (data.singerName4?.trim()) {
				formData.append('singerName4', data.singerName4.trim());
			}

			formData.append('songTitle', data.songTitle.trim());
			formData.append('artist', data.artist.trim());

			if (data.notes?.trim()) {
				formData.append('notes', data.notes.trim());
			}

			const result = await addSinger(eventId, formData);

			if (result.success) {
				toast.success(result.message);
				form.reset();
				setIsOpen(false);
				onSuccess?.();
				return true;
			} else {
				toast.error(result.message);
				// Handle field errors
				if (result.errors) {
					Object.entries(result.errors).forEach(([field, messages]) => {
						if (messages && field !== '_form') {
							form.setError(field as keyof AddAttendeeFormData, {
								message: messages[0],
							});
						}
					});
				}
				return false;
			}
		} catch (error) {
			console.error('Error adding attendee:', error);
			toast.error('Failed to add attendee. Please try again.');
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		form,
		performanceType,
		isSubmitting,
		isOpen,
		setIsOpen,
		handleSubmit: form.handleSubmit(handleSubmit),
	};
}
