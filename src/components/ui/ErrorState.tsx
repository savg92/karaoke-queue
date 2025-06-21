import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

interface ErrorStateProps {
	title?: string;
	description?: string;
	className?: string;
}

/**
 * Reusable error state component
 * Can be used across any feature that needs to display errors
 */
export function ErrorState({
	title = 'Error',
	description = 'Something went wrong. Please try again later.',
	className,
}: ErrorStateProps) {
	return (
		<Card className={className}>
			<CardHeader className='text-center'>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
		</Card>
	);
}
