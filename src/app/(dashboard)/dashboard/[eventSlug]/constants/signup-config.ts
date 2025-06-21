import { SignupStatus, PerformanceType } from '@prisma/client';

export const statusConfig = {
	[SignupStatus.QUEUED]: {
		label: 'Queued',
		variant: 'secondary' as const,
		color: 'bg-blue-100 text-blue-800',
	},
	[SignupStatus.PERFORMING]: {
		label: 'Performing',
		variant: 'default' as const,
		color: 'bg-green-100 text-green-800',
	},
	[SignupStatus.COMPLETE]: {
		label: 'Complete',
		variant: 'outline' as const,
		color: 'bg-gray-100 text-gray-800',
	},
	[SignupStatus.CANCELLED]: {
		label: 'Cancelled',
		variant: 'destructive' as const,
		color: 'bg-red-100 text-red-800',
	},
};

export const performanceTypeConfig = {
	[PerformanceType.SOLO]: 'Solo',
	[PerformanceType.DUET]: 'Duet',
	[PerformanceType.GROUP]: 'Group',
};
