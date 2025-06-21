import { toast } from 'sonner';
import { useClipboard } from './useClipboard';

interface ShareData {
	title: string;
	text: string;
	url: string;
}

/**
 * Reusable hook for sharing content with Web Share API fallback to clipboard
 * Can be used across any component that needs share functionality
 */
export function useWebShare() {
	const { copyToClipboard } = useClipboard();

	const share = async (data: ShareData, fallbackMessage?: string) => {
		if (navigator.share) {
			try {
				await navigator.share(data);
				return true;
			} catch (error) {
				// User cancelled share or error occurred
				if (error instanceof Error && error.name !== 'AbortError') {
					toast.error('Failed to share');
					// Fallback to clipboard
					copyToClipboard(
						data.url,
						fallbackMessage || 'Link copied to clipboard!'
					);
				}
				return false;
			}
		} else {
			// Fallback to clipboard if Web Share API is not available
			copyToClipboard(data.url, fallbackMessage || 'Link copied to clipboard!');
			return false;
		}
	};

	return { share, copyToClipboard };
}
