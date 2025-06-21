'use client';

import Link from 'next/link';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useCreateEventForm } from './hooks/useCreateEventForm';
import { EventDetailsFields } from './components/EventDetailsFields';
import { EventDateField } from './components/EventDateField';
import { FormActions } from '@/components/ui/FormActions';

export default function CreateEventPage() {
	const { form, isSubmitting, onSubmit, handleCancel } = useCreateEventForm();

	return (
		<div className='container mx-auto py-8 max-w-2xl'>
			<div className='mb-6'>
				<Link
					href='/dashboard'
					className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground'
				>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Back to Dashboard
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<CalendarIcon className='h-5 w-5' />
						Create New Karaoke Event
					</CardTitle>
					<CardDescription>
						Set up a new karaoke night and get a shareable link for attendees to
						sign up.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={onSubmit}
							className='space-y-6'
						>
							<EventDetailsFields control={form.control} />
							<EventDateField control={form.control} />
							<FormActions
								variant='default'
								isSubmitting={isSubmitting}
								submitText='Create Event'
								submitingText='Creating Event...'
								onCancel={handleCancel}
								cancelVariant='destructive'
							/>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
