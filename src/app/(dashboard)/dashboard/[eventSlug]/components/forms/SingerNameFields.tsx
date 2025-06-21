import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { AddAttendeeFormData } from '@/lib/validators/add-attendee';

interface SingerNameFieldsProps {
	control: Control<AddAttendeeFormData>;
	performanceType: string;
}

export function SingerNameFields({
	control,
	performanceType,
}: SingerNameFieldsProps) {
	if (performanceType === 'SOLO') {
		return (
			<FormField
				control={control}
				name='singerName'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Singer Name</FormLabel>
						<FormControl>
							<Input
								placeholder='Enter singer name'
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	}

	if (performanceType === 'DUET') {
		return (
			<div className='space-y-4'>
				<FormField
					control={control}
					name='singerName1'
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Singer</FormLabel>
							<FormControl>
								<Input
									placeholder='Enter first singer name'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name='singerName2'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Second Singer</FormLabel>
							<FormControl>
								<Input
									placeholder='Enter second singer name'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		);
	}

	if (performanceType === 'GROUP') {
		return (
			<div className='space-y-4'>
				<FormField
					control={control}
					name='singerName1'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Singer 1</FormLabel>
							<FormControl>
								<Input
									placeholder='Enter first singer name'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name='singerName2'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Singer 2</FormLabel>
							<FormControl>
								<Input
									placeholder='Enter second singer name'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name='singerName3'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Singer 3</FormLabel>
							<FormControl>
								<Input
									placeholder='Enter third singer name'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name='singerName4'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Singer 4 (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder='Enter fourth singer name'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		);
	}

	return null;
}
