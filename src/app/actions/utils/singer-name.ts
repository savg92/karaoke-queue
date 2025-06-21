import { PerformanceType } from '@prisma/client';
import { ValidatedSignupData } from './form-data';

export function buildSingerName(data: ValidatedSignupData): string {
	switch (data.performanceType) {
		case PerformanceType.SOLO:
			return data.singerName!;
		case PerformanceType.DUET:
			return `${data.singerName1} & ${data.singerName2}`;
		case PerformanceType.GROUP:
			const groupSingers = [
				data.singerName1,
				data.singerName2,
				data.singerName3,
				data.singerName4,
			].filter((name) => name && name.trim().length > 0);
			return groupSingers.join(' & ');
		default:
			throw new Error(`Unknown performance type: ${data.performanceType}`);
	}
}
