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
import { SignupFormData } from '@/lib/validators/signup';

interface SongDetailsInputsProps {
	control: Control<SignupFormData>;
}

export function SongDetailsInputs({ control }: SongDetailsInputsProps) {
	return (
		<div className='space-y-6'>
			<FormField
				control={control}
				name='songTitle'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Song Title</FormLabel>
						<FormControl>
							<Input
								placeholder='Enter the song title'
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name='artist'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Artist</FormLabel>
						<FormControl>
							<Input
								placeholder='Enter the artist name'
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name='notes'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Notes (Optional)</FormLabel>
						<FormControl>
							<Textarea
								placeholder='Any special notes or requests...'
								className='resize-none'
								{...field}
							/>
						</FormControl>
						<FormDescription>
							Add any special notes or requests for your performance.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
