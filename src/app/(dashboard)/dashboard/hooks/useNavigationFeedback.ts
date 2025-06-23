'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseNavigationFeedbackProps {
	eventId: string;
	eventName: string;
}

export function useNavigationFeedback({
	eventId,
	eventName,
}: UseNavigationFeedbackProps) {
	const [isNavigating, setIsNavigating] = useState(false);
	const router = useRouter();
	const toastIdRef = useRef<string | number | null>(null);

	const navigateToEvent = async (eventSlug: string) => {
		setIsNavigating(true);
		window.dispatchEvent(new CustomEvent('navigation-start'));

		// Use a consistent toast ID to prevent duplicates
		const toastId = `loading-toast-${eventId}`;

		toastIdRef.current = toast.loading(`Loading ${eventName} dashboard...`, {
			id: toastId,
		});

		try {
			router.push(`/dashboard/${eventSlug}`);
		} catch (error) {
			console.error('Navigation error:', error);
			if (toastIdRef.current) {
				toast.dismiss(toastIdRef.current);
				toastIdRef.current = null;
			}
			toast.error('Failed to load dashboard. Please try again.');
			setIsNavigating(false);
			// Ensure progress bar completes on error
			window.dispatchEvent(new CustomEvent('navigation-complete'));
		}
	};

	// Cleanup on unmount is the primary mechanism for dismissing the toast.
	useEffect(() => {
		return () => {
			if (toastIdRef.current) {
				toast.dismiss(toastIdRef.current);
				toastIdRef.current = null;
			}
			// This ensures the navigation progress bar completes if the user
			// navigates away before the destination page loads.
			window.dispatchEvent(new CustomEvent('navigation-complete'));
		};
	}, []);

	return {
		isNavigating,
		navigateToEvent,
	};
}
