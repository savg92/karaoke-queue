'use client';

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { SignupFormData } from '@/lib/validators/signup';

interface SignupFormFieldsProps {
	control: Control<SignupFormData>;
	performanceType: string;
}

export function SignupFormFields({
	control,
	performanceType,
}: SignupFormFieldsProps) {
	return (
		<div className='space-y-6'>
			<FormField
				control={control}
				name='performanceType'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Performance Type</FormLabel>
						<Select
							onValueChange={field.onChange}
							defaultValue={field.value}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder='Select performance type' />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value='SOLO'>Solo</SelectItem>
								<SelectItem value='DUET'>Duet</SelectItem>
								<SelectItem value='GROUP'>Group</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			{performanceType === 'SOLO' && (
				<FormField
					control={control}
					name='singerName'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Your Name</FormLabel>
							<FormControl>
								<Input
									placeholder='Enter your name'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{performanceType === 'DUET' && (
				<div className='space-y-4'>
					<FormField
						control={control}
						name='singerName1'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Singer 1 Name</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter first singer's name"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			)}
		</div>
	);
}
