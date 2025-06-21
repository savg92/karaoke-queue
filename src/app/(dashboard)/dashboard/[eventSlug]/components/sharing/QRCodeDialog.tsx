'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { QRCodeActions } from './QRCodeActions';
import { useClipboard } from '@/lib/hooks/useClipboard';
import { useWebShare } from '@/lib/hooks/useWebShare';
import { downloadQRCode } from '../../utils/qr-download';

interface QRCodeDialogProps {
	eventUrl: string;
	eventName: string;
	eventDate: Date;
}

export function QRCodeDialog({
	eventUrl,
	eventName,
	eventDate,
}: QRCodeDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const qrRef = useRef<SVGSVGElement>(null);
	const { copied, copyToClipboard } = useClipboard();
	const { share } = useWebShare();

	const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const handleCopyUrl = () => {
		copyToClipboard(eventUrl);
	};

	const handleShare = () => {
		share(
			{
				title: `Join ${eventName} Karaoke Queue`,
				text: `Join the karaoke queue for ${eventName} on ${formattedDate}!`,
				url: eventUrl,
			},
			'Event link copied to clipboard!'
		);
	};

	const handleDownload = () => {
		downloadQRCode(qrRef.current, {
			eventName,
			eventDate: formattedDate,
			eventUrl,
		});
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button variant='outline'>
					<QrCode className='mr-2 h-4 w-4' />
					QR Code
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>QR Code for {eventName}</DialogTitle>
					<DialogDescription>
						Share this QR code with guests so they can easily join the karaoke
						queue for {formattedDate}.
					</DialogDescription>
				</DialogHeader>
				<QRCodeDisplay
					ref={qrRef}
					eventUrl={eventUrl}
					eventName={eventName}
					eventDate={formattedDate}
				/>
				<QRCodeActions
					onCopyUrl={handleCopyUrl}
					onShare={handleShare}
					onDownload={handleDownload}
					copied={copied}
				/>
			</DialogContent>
		</Dialog>
	);
}
