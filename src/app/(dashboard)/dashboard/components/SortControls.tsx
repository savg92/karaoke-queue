import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SortOption, SortDirection } from '../hooks/useEventSorting';

interface SortControlsProps {
	sortBy: SortOption;
	setSortBy: (value: SortOption) => void;
	sortDirection: SortDirection;
	setSortDirection: (value: SortDirection) => void;
}

export function SortControls({
	sortBy,
	setSortBy,
	sortDirection,
	setSortDirection,
}: SortControlsProps) {
	return (
		<div className='flex gap-4 items-center'>
			<span className='text-sm font-medium text-muted-foreground'>
				Sort by:
			</span>
			<Select
				value={sortBy}
				onValueChange={setSortBy}
			>
				<SelectTrigger className='w-[140px]'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='date'>Event Date</SelectItem>
					<SelectItem value='name'>Name</SelectItem>
					<SelectItem value='signups'>Signups</SelectItem>
					<SelectItem value='created'>Created Date</SelectItem>
				</SelectContent>
			</Select>
			<Select
				value={sortDirection}
				onValueChange={setSortDirection}
			>
				<SelectTrigger className='w-[120px]'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='desc'>Newest First</SelectItem>
					<SelectItem value='asc'>Oldest First</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
