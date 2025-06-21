import { PerformanceType } from '@prisma/client';

export interface ValidatedSignupData {
	performanceType: PerformanceType;
	singerName?: string;
	singerName1?: string;
	singerName2?: string;
	singerName3?: string;
	singerName4?: string;
	songTitle: string;
	artist: string;
	notes?: string;
}

export function extractFormData(formData: FormData) {
	return {
		performanceType: formData.get('performanceType'),
		singerName: formData.get('singerName') || undefined,
		singerName1: formData.get('singerName1') || undefined,
		singerName2: formData.get('singerName2') || undefined,
		singerName3: formData.get('singerName3') || undefined,
		singerName4: formData.get('singerName4') || undefined,
		songTitle: formData.get('songTitle'),
		artist: formData.get('artist'),
		notes: formData.get('notes') || '',
	};
}
