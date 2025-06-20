'use client';

import { DashboardClient } from './components/DashboardClient';
import { useState, useEffect } from 'react';

interface DashboardPageProps {
	params: Promise<{ eventSlug: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
	const [eventSlug, setEventSlug] = useState<string>('');

	useEffect(() => {
		params.then(({ eventSlug }) => setEventSlug(eventSlug));
	}, [params]);

	if (!eventSlug) {
		return <div>Loading...</div>;
	}

	return <DashboardClient eventSlug={eventSlug} />;
}
