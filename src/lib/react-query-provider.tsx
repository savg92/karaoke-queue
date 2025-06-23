'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
						refetchOnReconnect: true,
						retry: (failureCount, error) => {
							// Don't retry auth errors
							if (
								error instanceof Error &&
								error.message.includes('Unauthorized')
							) {
								return false;
							}
							// Retry up to 2 times for other errors
							return failureCount < 2;
						},
						retryDelay: (attemptIndex) =>
							Math.min(1000 * 2 ** attemptIndex, 30000),
						// Enable background refetching for better UX
						refetchOnMount: 'always',
					},
					mutations: {
						retry: 1,
						retryDelay: 1000,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
