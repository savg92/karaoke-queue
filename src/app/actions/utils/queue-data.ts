import { prisma } from '@/lib/prisma';
import { SignupStatus } from '@prisma/client';

export async function getCurrentQueue(eventId: string) {
	return await prisma.signup.findMany({
		where: {
			eventId: eventId,
			status: SignupStatus.QUEUED,
		},
		orderBy: {
			position: 'asc',
		},
		select: {
			id: true,
			singerName: true,
			position: true,
			createdAt: true,
		},
	});
}
