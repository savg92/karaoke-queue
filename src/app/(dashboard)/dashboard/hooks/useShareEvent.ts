import { useWebShare } from '@/lib/hooks/useWebShare';

export function useShareEvent() {
	const { shareOnly, copyToClipboard } = useWebShare();

	const handleShareEvent = async (eventSlug: string, eventName: string) => {
		const signupUrl = `${window.location.origin}/event/${eventSlug}`;

		await shareOnly({
			title: `Join ${eventName} - Karaoke Night`,
			text: `Sign up to sing at ${eventName}!`,
			url: signupUrl,
		});
	};

	const copyEventToClipboard = (eventSlug: string) => {
		const signupUrl = `${window.location.origin}/event/${eventSlug}`;
		copyToClipboard(signupUrl, 'Signup link copied to clipboard!');
	};

	return { handleShareEvent, copyToClipboard: copyEventToClipboard };
}
