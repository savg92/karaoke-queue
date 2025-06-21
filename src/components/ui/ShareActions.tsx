import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';

interface ShareActionsProps {
	onCopy: () => void;
	onShare: () => void;
	className?: string;
}

/**
 * Reusable share action buttons
 * Can be used in any card or component that needs share/copy functionality
 */
export function ShareActions({
	onCopy,
	onShare,
	className,
}: ShareActionsProps) {
	return (
		<div className={`flex gap-1 ${className || ''}`}>
			<Button
				variant='ghost'
				size='sm'
				onClick={onCopy}
				className='h-8 w-8 p-0'
				title='Copy link'
			>
				<Copy className='h-4 w-4' />
			</Button>
			<Button
				variant='ghost'
				size='sm'
				onClick={onShare}
				className='h-8 w-8 p-0'
				title='Share'
			>
				<Share2 className='h-4 w-4' />
			</Button>
		</div>
	);
}
