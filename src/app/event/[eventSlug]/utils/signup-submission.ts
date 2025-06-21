import { addSinger } from '@/app/actions/add-singer';
import { SignupFormData } from '@/lib/validators/signup';

export async function submitSignupForm(
	eventId: string,
	data: SignupFormData
): Promise<{
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
}> {
	// Create FormData from the validated data
	const formData = new FormData();
	formData.append('performanceType', data.performanceType);
	formData.append('songTitle', data.songTitle);
	formData.append('artist', data.artist);
	formData.append('notes', data.notes || '');

	// Append names based on performance type
	if (data.performanceType === 'SOLO') {
		formData.append('singerName', data.singerName || '');
	} else if (data.performanceType === 'DUET') {
		formData.append('singerName1', data.singerName1 || '');
		formData.append('singerName2', data.singerName2 || '');
	} else if (data.performanceType === 'GROUP') {
		formData.append('singerName1', data.singerName1 || '');
		formData.append('singerName2', data.singerName2 || '');
		formData.append('singerName3', data.singerName3 || '');
		formData.append('singerName4', data.singerName4 || '');
	}

	return await addSinger(eventId, formData);
}
