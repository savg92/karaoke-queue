import { useWebShare } from '@/lib/hooks/useWebShare';

export function useShareEvent() {
	const { share, copyToClipboard } = useWebShare();

	const handleShareEvent = async (eventSlug: string, eventName: string) => {
		const signupUrl = `${window.location.origin}/event/${eventSlug}`;

		await share(
			{
				title: `Join ${eventName} - Karaoke Night`,
				text: `Sign up to sing at ${eventName}!`,
				url: signupUrl,
			},
			'Signup link copied to clipboard!'
		);
	};

	const copyEventToClipboard = (eventSlug: string) => {
		const signupUrl = `${window.location.origin}/event/${eventSlug}`;
		copyToClipboard(signupUrl, 'Signup link copied to clipboard!');
	};

	return { handleShareEvent, copyToClipboard: copyEventToClipboard };
}
