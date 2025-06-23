// Define types manually to work around Prisma import issues
export type PerformanceType = 'SOLO' | 'DUET' | 'GROUP';
export type SignupStatus = 'QUEUED' | 'PERFORMING' | 'COMPLETE' | 'CANCELLED';

export type Event = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	date: Date;
	hostId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type Profile = {
	id: string;
	email: string;
	givenName: string | null;
	familyName: string | null;
	picture: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type Signup = {
	id: string;
	singerName: string;
	songTitle: string;
	artist: string;
	performanceType: PerformanceType;
	notes: string | null;
	position: number;
	status: SignupStatus;
	performingAt: Date | null;
	eventId: string;
	createdAt: Date;
	updatedAt: Date;
};

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
	performingAt?: Date | null;
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
