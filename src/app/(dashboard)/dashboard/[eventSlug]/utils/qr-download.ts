import { toast } from 'sonner';

interface QRDownloadOptions {
	eventName: string;
	eventDate: string;
	eventUrl: string;
}

export function downloadQRCode(
	qrElement: SVGSVGElement | null,
	options: QRDownloadOptions
) {
	if (!qrElement) return;

	const { eventName, eventDate, eventUrl } = options;

	// Create a canvas to convert SVG to image
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const img = new Image();
	const svgData = new XMLSerializer().serializeToString(qrElement);
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
		ctx.fillText(eventDate, 200, 385);

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
}
