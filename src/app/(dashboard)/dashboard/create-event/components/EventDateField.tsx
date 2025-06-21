'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Control } from 'react-hook-form';
import { CreateEventForm } from '../validation';

interface EventDateFieldProps {
	control: Control<CreateEventForm>;
}

export function EventDateField({ control }: EventDateFieldProps) {
	return (
		<FormField
			control={control}
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
	);
}
