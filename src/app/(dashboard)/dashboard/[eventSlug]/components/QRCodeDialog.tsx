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
import { QrCode, Copy, Share, Download, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

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
	const [copied, setCopied] = useState(false);
	const qrRef = useRef<SVGSVGElement>(null);

	const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(eventUrl);
			setCopied(true);
			toast.success('Event URL copied to clipboard!');
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy URL:', err);
			toast.error('Failed to copy URL');
		}
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: `Join ${eventName} Karaoke Queue`,
					text: `Join the karaoke queue for ${eventName} on ${formattedDate}!`,
					url: eventUrl,
				});
			} catch (error) {
				// User cancelled share or error occurred
				if (error instanceof Error && error.name !== 'AbortError') {
					toast.error('Failed to share');
				}
			}
		} else {
			// Fallback to copying URL if Web Share API is not available
			handleCopyUrl();
		}
	};

	const handleDownload = () => {
		const svg = qrRef.current;
		if (!svg) return;

		// Create a canvas to convert SVG to image
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		const svgData = new XMLSerializer().serializeToString(svg);
		const svgBlob = new Blob([svgData], {
			type: 'image/svg+xml;charset=utf-8',
		});
		const url = URL.createObjectURL(svgBlob);

		img.onload = () => {
			// Make canvas taller to accommodate text
			canvas.width = 400;
			canvas.height = 450;

			// Fill background with white
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, 400, 450);

			// Draw the QR code centered horizontally, with space for text below
			const qrSize = 300;
			const qrX = (400 - qrSize) / 2;
			const qrY = 30;
			ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

			// Add event title
			ctx.fillStyle = 'black';
			ctx.font = 'bold 24px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(eventName, 200, 360);

			// Add event date
			ctx.font = '18px Arial';
			ctx.fillStyle = '#666';
			ctx.fillText(formattedDate, 200, 385);

			// Add URL
			ctx.font = '14px Arial';
			ctx.fillStyle = '#999';
			const shortUrl = eventUrl.replace(/^https?:\/\//, '');
			ctx.fillText(shortUrl, 200, 410);

			// Download the image
			canvas.toBlob((blob) => {
				if (blob) {
					const downloadUrl = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.download = `${eventName
						.replace(/[^a-z0-9]/gi, '_')
						.toLowerCase()}_qr_code.png`;
					link.href = downloadUrl;
					link.click();
					URL.revokeObjectURL(downloadUrl);
					toast.success('QR code downloaded!');
				}
			}, 'image/png');

			URL.revokeObjectURL(url);
		};

		img.src = url;
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
				<div className='flex items-center justify-center p-6'>
					<QRCodeSVG
						ref={qrRef}
						value={eventUrl}
						size={200}
						level='M'
						className='border rounded-lg'
					/>
				</div>
				<div className='text-center space-y-2 mb-4'>
					<p className='text-lg font-semibold'>{eventName}</p>
					<p className='text-sm text-muted-foreground'>{formattedDate}</p>
				</div>
				<div className='flex items-center justify-center mb-4'>
					<p className='text-sm text-muted-foreground text-center break-all px-4'>
						{eventUrl}
					</p>
				</div>
				<div className='flex flex-col sm:flex-row gap-2'>
					<Button
						onClick={handleCopyUrl}
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
						onClick={handleShare}
						variant='outline'
						className='flex-1'
					>
						<Share className='mr-2 h-4 w-4' />
						Share
					</Button>
					<Button
						onClick={handleDownload}
						variant='outline'
						className='flex-1'
					>
						<Download className='mr-2 h-4 w-4' />
						Download
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
