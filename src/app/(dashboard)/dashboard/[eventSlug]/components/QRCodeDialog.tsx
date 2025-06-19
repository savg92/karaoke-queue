'use client';

import { useState } from 'react';
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
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDialogProps {
	eventUrl: string;
	eventName: string;
}

export function QRCodeDialog({ eventUrl, eventName }: QRCodeDialogProps) {
	const [isOpen, setIsOpen] = useState(false);

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
						queue.
					</DialogDescription>
				</DialogHeader>
				<div className='flex items-center justify-center p-6'>
					<QRCodeSVG
						value={eventUrl}
						size={200}
						level='M'
						includeMargin={true}
						className='border rounded-lg'
					/>
				</div>
				<div className='flex items-center justify-center'>
					<p className='text-sm text-muted-foreground text-center break-all'>
						{eventUrl}
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
