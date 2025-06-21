import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Reusable hook for copying text to clipboard with fallback
 * Can be used across any component that needs copy functionality
 */
export function useClipboard() {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async (
		text: string,
		successMessage = 'Copied to clipboard!'
	) => {
		try {
			// Check if Clipboard API is available
			if (!navigator.clipboard) {
				toast.error('Clipboard not supported in this browser');
				return false;
			}

			// Check if we're in a secure context (HTTPS)
			if (!window.isSecureContext) {
				toast.error('Clipboard access requires HTTPS');
				return false;
			}

			await navigator.clipboard.writeText(text);
			toast.success(successMessage);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			return true;
		} catch (error) {
			console.error('Failed to copy text:', error);
			toast.error('Failed to copy to clipboard');
			return false;
		}
	};

	return { copied, copyToClipboard };
}
