import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';

interface ShareActionsProps {
	onCopy: () => void;
	onShare: () => void;
	className?: string;
	showText?: boolean;
}

/**
 * Reusable share action buttons
 * Can be used in any card or component that needs share/copy functionality
 */
export function ShareActions({
	onCopy,
	onShare,
	className,
	showText = false,
}: ShareActionsProps) {
	return (
		<div className={`flex gap-2 ${className || ''}`}>
			<Button
				variant={showText ? 'outline' : 'ghost'}
				size={showText ? 'default' : 'sm'}
				onClick={onCopy}
				className={!showText ? 'h-8 w-8 p-0' : ''}
				title='Copy link'
			>
				<Copy className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
				{showText && 'Copy Link'}
			</Button>
			<Button
				variant={showText ? 'outline' : 'ghost'}
				size={showText ? 'default' : 'sm'}
				onClick={onShare}
				className={!showText ? 'h-8 w-8 p-0' : ''}
				title='Share'
			>
				<Share2 className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
				{showText && 'Share Event'}
			</Button>
		</div>
	);
}
