'use client';

import { Button } from '@/components/ui/button';
import { Copy, Share, Download, Check } from 'lucide-react';

interface QRCodeActionsProps {
	onCopyUrl: () => void;
	onShare: () => void;
	onDownload: () => void;
	copied: boolean;
}

export function QRCodeActions({
	onCopyUrl,
	onShare,
	onDownload,
	copied,
}: QRCodeActionsProps) {
	return (
		<div className='flex flex-col sm:flex-row gap-2'>
			<Button
				onClick={onCopyUrl}
				variant='outline'
				className='flex-1'
			>
				{copied ? (
					<>
						<Check className='mr-2 h-4 w-4' />
						Copied!
					</>
				) : (
					<>
						<Copy className='mr-2 h-4 w-4' />
						Copy URL
					</>
				)}
			</Button>
			<Button
				onClick={onShare}
				variant='outline'
				className='flex-1'
			>
				<Share className='mr-2 h-4 w-4' />
				Share
			</Button>
			<Button
				onClick={onDownload}
				variant='outline'
				className='flex-1'
			>
				<Download className='mr-2 h-4 w-4' />
				Download
			</Button>
		</div>
	);
}
