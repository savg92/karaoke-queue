import { useState, useMemo } from 'react';

export type SortOption = 'name' | 'date' | 'signups' | 'created';
export type SortDirection = 'asc' | 'desc';

type Event = {
	id: string;
	name: string;
	slug: string;
	date: Date;
	createdAt: Date;
};

type UserEventsData = {
	profile: { events: Event[] };
	eventCounts: Record<string, number>;
};

export function useEventSorting(data: UserEventsData | undefined) {
	const [sortBy, setSortBy] = useState<SortOption>('date');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

	const sortedEvents = useMemo(() => {
		if (!data?.profile.events) return [];

		const events = [...data.profile.events];

		return events.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'date':
					comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
				case 'signups':
					const aSignups = data.eventCounts[a.id] || 0;
					const bSignups = data.eventCounts[b.id] || 0;
					comparison = aSignups - bSignups;
					break;
				case 'created':
					comparison =
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
			}

			return sortDirection === 'asc' ? comparison : -comparison;
		});
	}, [data, sortBy, sortDirection]);

	return {
		sortBy,
		setSortBy,
		sortDirection,
		setSortDirection,
		sortedEvents,
	};
}
