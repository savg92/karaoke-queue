'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createEventSchema, type CreateEventForm } from '../validation';
import { createEvent } from '../actions';

export function useCreateEventForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<CreateEventForm>({
		resolver: zodResolver(createEventSchema),
		defaultValues: {
			name: '',
			description: '',
			date: new Date(), // Default to today
		},
	});

	const onSubmit = async (data: CreateEventForm) => {
		setIsSubmitting(true);
		try {
			// Convert the Date to ISO string for the server action
			const eventData = {
				...data,
				date: data.date.toISOString(),
			};
			const result = await createEvent(eventData);
			if (result.success) {
				// Invalidate the userEvents query to refresh the dashboard
				await queryClient.invalidateQueries({ queryKey: ['userEvents'] });

				toast.success('Event created successfully!');
				router.push(`/dashboard/${result.event?.slug}`);
			} else {
				toast.error(result.error || 'Failed to create event');
			}
		} catch (error) {
			console.error('Error creating event:', error);
			toast.error('An unexpected error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push('/dashboard');
	};

	return {
		form,
		isSubmitting,
		onSubmit: form.handleSubmit(onSubmit),
		handleCancel,
	};
}
