'use client';

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { SignupFormData } from '@/lib/validators/signup';

interface SingerNameInputsProps {
	control: Control<SignupFormData>;
	performanceType: string;
}

export function SingerNameInputs({
	control,
	performanceType,
}: SingerNameInputsProps) {
	if (performanceType === 'SOLO') {
		return (
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
				<FormField
					control={control}
					name='singerName2'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Singer 2 Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter second singer's name"
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
				<FormField
					control={control}
					name='singerName2'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Singer 2 Name (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter second singer's name"
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
							<FormLabel>Singer 3 Name (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter third singer's name"
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
							<FormLabel>Singer 4 Name (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter fourth singer's name"
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
