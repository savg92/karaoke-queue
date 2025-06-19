'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createEvent } from './actions';

// Validation schema for creating an event
const createEventSchema = z.object({
	name: z
		.string()
		.min(1, 'Event name is required')
		.max(100, 'Event name must be less than 100 characters'),
	description: z.string().optional(),
	date: z.date({
		required_error: 'Event date is required',
	}),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
	const router = useRouter();
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
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-6'
						>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Event Name</FormLabel>
										<FormControl>
											<Input
												placeholder='Friday Night Karaoke'
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Give your karaoke event a memorable name.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description (Optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Join us for an amazing night of karaoke fun! Drinks and snacks will be provided.'
												className='resize-none'
												rows={3}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Add details about your event, venue, or special
											instructions.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='date'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel>Event Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={'outline'}
														className={cn(
															'w-full pl-3 text-left font-normal',
															!field.value && 'text-muted-foreground'
														)}
													>
														{field.value ? (
															format(field.value, 'PPP')
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className='w-auto p-0'
												align='start'
											>
												<Calendar
													mode='single'
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date < new Date(new Date().setHours(0, 0, 0, 0))
													}
													// captionLayout='dropdown'
													className='rounded-md border shadow-sm'
												/>
											</PopoverContent>
										</Popover>
										<FormDescription>
											When is your karaoke event happening?
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='flex gap-4 pt-4'>
								<Button
									type='submit'
									disabled={isSubmitting}
									className='flex-1'
								>
									{isSubmitting ? 'Creating Event...' : 'Create Event'}
								</Button>
								<Button
									type='button'
									variant='destructive'
									onClick={() => router.push('/dashboard')}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
