import { Control } from 'react-hook-form';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AddAttendeeFormData } from '@/lib/validators/add-attendee';

interface SongDetailsFieldsProps {
	control: Control<AddAttendeeFormData>;
}

export function SongDetailsFields({ control }: SongDetailsFieldsProps) {
	return (
		<>
			<FormField
				control={control}
				name='songTitle'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Song Title</FormLabel>
						<FormControl>
							<Input
								placeholder='Enter song title'
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
								placeholder='Enter artist name'
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
								placeholder='Any additional notes...'
								className='resize-none'
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
