'use client';

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { SignupFormData } from '@/lib/validators/signup';

interface PerformanceTypeSelectProps {
	control: Control<SignupFormData>;
}

export function PerformanceTypeSelect({ control }: PerformanceTypeSelectProps) {
	return (
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
	);
}
