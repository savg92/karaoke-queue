import { SignupStatus, PerformanceType } from '@prisma/client';

export type EventSignup = {
	id: string;
	position: number;
	singerName: string;
	songTitle: string;
	artist: string;
	performanceType: PerformanceType;
	status: SignupStatus;
};

export type EventWithSignups = {
	id: string;
	name: string;
	date: Date;
	signups: EventSignup[];
};
