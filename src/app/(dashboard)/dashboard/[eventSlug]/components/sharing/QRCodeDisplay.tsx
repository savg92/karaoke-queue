'use client';

import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
	eventUrl: string;
	eventName: string;
	eventDate: string;
}

export const QRCodeDisplay = forwardRef<SVGSVGElement, QRCodeDisplayProps>(
	({ eventUrl, eventName, eventDate }, ref) => {
		return (
			<div className='space-y-4'>
				<div className='flex items-center justify-center p-6'>
					<QRCodeSVG
						ref={ref}
						value={eventUrl}
						size={200}
						level='M'
						className='border rounded-lg'
					/>
				</div>
				<div className='text-center space-y-2 mb-4'>
					<p className='text-lg font-semibold'>{eventName}</p>
					<p className='text-sm text-muted-foreground'>{eventDate}</p>
				</div>
				<div className='flex items-center justify-center mb-4'>
					<p className='text-sm text-muted-foreground text-center break-all px-4'>
						{eventUrl}
					</p>
				</div>
			</div>
		);
	}
);

QRCodeDisplay.displayName = 'QRCodeDisplay';
