'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { CreateEventForm } from '../validation';

interface EventDetailsFieldsProps {
	control: Control<CreateEventForm>;
}

export function EventDetailsFields({ control }: EventDetailsFieldsProps) {
	return (
		<div className='space-y-6'>
			<FormField
				control={control}
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
				control={control}
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
							Add details about your event, venue, or special instructions.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
