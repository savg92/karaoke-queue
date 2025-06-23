import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CardGridLoadingProps {
	count?: number;
	className?: string;
}

/**
 * Reusable loading state for card grids
 * Can be used across any feature that displays cards in a grid layout
 */
export function CardGridLoading({
	count = 6,
	className,
}: CardGridLoadingProps) {
	return (
		<div
			className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className || ''}`}
		>
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i}>
					<CardHeader>
						<Skeleton className='h-6 w-3/4' />
						<Skeleton className='h-4 w-1/2' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-4 w-1/4 mb-4' />
						<Skeleton className='h-10 w-full' />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
