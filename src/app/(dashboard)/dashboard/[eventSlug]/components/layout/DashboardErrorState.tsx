import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardErrorStateProps {
	onRetry: () => void;
}

export function DashboardErrorState({ onRetry }: DashboardErrorStateProps) {
	return (
		<div className='container mx-auto py-8'>
			<div className='text-center'>
				<h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
				<p className='text-muted-foreground mb-4'>
					Failed to load event data. Please try again.
				</p>
				<Button onClick={onRetry}>
					<RefreshCw className='mr-2 h-4 w-4' />
					Retry
				</Button>
			</div>
		</div>
	);
}
