/**
 * Utility Components for RBAC Dashboard
 */

'use client';

import { useState, useEffect } from 'react';

// Client-side only timestamp to avoid hydration mismatch
export function ClientTimestamp() {
	const [timestamp, setTimestamp] = useState<string>('');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const updateTime = () => {
			setTimestamp(new Date().toLocaleTimeString());
		};

		updateTime(); // Set initial time
		const interval = setInterval(updateTime, 1000); // Update every second

		return () => clearInterval(interval);
	}, []);

	if (!mounted) {
		return (
			<span className='text-sm text-gray-600'>Last updated: --:--:--</span>
		);
	}

	return (
		<span className='text-sm text-gray-600'>Last updated: {timestamp}</span>
	);
}

// Safe date formatter to avoid hydration mismatch
export function SafeDateFormat({
	date,
	format = 'full',
}: {
	date: Date | string;
	format?: 'date' | 'time' | 'full';
}) {
	const [formatted, setFormatted] = useState<string>('--');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const dateObj = typeof date === 'string' ? new Date(date) : date;

		switch (format) {
			case 'date':
				setFormatted(dateObj.toLocaleDateString());
				break;
			case 'time':
				setFormatted(dateObj.toLocaleTimeString());
				break;
			default:
				setFormatted(dateObj.toLocaleString());
		}
	}, [date, format]);

	if (!mounted) {
		return <span>--</span>;
	}

	return <span>{formatted}</span>;
}
