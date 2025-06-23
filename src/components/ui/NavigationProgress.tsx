'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const pathname = usePathname();

	useEffect(() => {
		// Reset progress when pathname changes
		setIsLoading(false);
		setProgress(0);
	}, [pathname]);

	// Expose a method to trigger loading state
	useEffect(() => {
		const startLoading = () => {
			setIsLoading(true);
			setProgress(10);
		};

		const completeLoading = () => {
			setProgress(100);
			setTimeout(() => {
				setIsLoading(false);
				setProgress(0);
			}, 200);
		};

		// Add global event listeners for navigation
		window.addEventListener('navigation-start', startLoading);
		window.addEventListener('navigation-complete', completeLoading);

		return () => {
			window.removeEventListener('navigation-start', startLoading);
			window.removeEventListener('navigation-complete', completeLoading);
		};
	}, []);

	useEffect(() => {
		// Simulate progress updates
		let interval: NodeJS.Timeout;
		if (isLoading) {
			interval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 90) return prev;
					return prev + Math.random() * 10;
				});
			}, 200);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isLoading]);

	if (!isLoading) return null;

	return (
		<div
			className='fixed top-0 left-0 z-50 h-1 bg-primary transition-all duration-200 ease-out'
			style={{
				width: `${progress}%`,
				boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
			}}
		/>
	);
}
