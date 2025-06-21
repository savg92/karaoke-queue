import { prisma } from '@/lib/prisma';
import { SignupStatus, PerformanceType } from '@prisma/client';
import { ValidatedSignupData } from './form-data';

export async function createSignup(
	eventId: string,
	singerName: string,
	data: ValidatedSignupData,
	position: number
) {
	return await prisma.signup.create({
		data: {
			eventId: eventId,
			singerName: singerName,
			songTitle: data.songTitle,
			artist: data.artist,
			performanceType: data.performanceType as PerformanceType,
			status: SignupStatus.QUEUED,
			position: position,
		},
	});
}
