import { Control } from 'react-hook-form';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { AddAttendeeFormData } from '@/lib/validators/add-attendee';

interface PerformanceTypeSelectorProps {
	control: Control<AddAttendeeFormData>;
}

export function PerformanceTypeSelector({
	control,
}: PerformanceTypeSelectorProps) {
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
							<SelectItem value='GROUP'>Group (3+)</SelectItem>
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
