import {
	Event,
	Signup,
	Profile,
	PerformanceType,
	SignupStatus,
} from '@prisma/client';

export type EventWithQueue = Event & {
	host: Profile;
	signups: Signup[];
};

export type QueueItem = {
	id: string;
	createdAt: Date;
	singerName: string;
	songTitle: string;
	artist: string;
	performanceType: PerformanceType;
	status: SignupStatus;
	position: number;
	notes?: string | null;
};

export type EventDetails = {
	id: string;
	name: string;
	slug: string;
	date: Date;
	description?: string | null;
};

export type EventQueueData = {
	event: EventDetails;
	signups: QueueItem[];
};
