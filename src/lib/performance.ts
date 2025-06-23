/**
 * Performance monitoring utilities for the Karaoke Queue application
 */

import { QueryClient } from '@tanstack/react-query';

// Database query performance monitoring
export function measureDatabaseQuery<T>(
	queryName: string,
	queryFn: () => Promise<T>
): Promise<T> {
	const start = performance.now();

	return queryFn()
		.then((result) => {
			const duration = performance.now() - start;

			// Log slow queries (> 500ms)
			if (duration > 500) {
				console.warn(
					`Slow database query detected: ${queryName} (${duration.toFixed(
						2
					)}ms)`
				);
			}

			// In production, send to monitoring service
			if (process.env.NODE_ENV === 'production') {
				// Example: sendToMonitoring({ queryName, duration, type: 'database' });
			}

			return result;
		})
		.catch((error) => {
			const duration = performance.now() - start;
			console.error(
				`Database query failed: ${queryName} (${duration.toFixed(2)}ms)`,
				error
			);
			throw error;
		});
}

// Component render performance monitoring
export function measureComponentRender(componentName: string) {
	if (process.env.NODE_ENV === 'development') {
		const start = performance.now();

		return () => {
			const duration = performance.now() - start;
			if (duration > 16) {
				// > 1 frame at 60fps
				console.warn(
					`Slow component render: ${componentName} (${duration.toFixed(2)}ms)`
				);
			}
		};
	}

	return () => {}; // No-op in production
}

// Server action performance monitoring
export function withPerformanceMonitoring<T extends unknown[], R>(
	actionName: string,
	action: (...args: T) => Promise<R>
) {
	return async (...args: T): Promise<R> => {
		const start = performance.now();

		try {
			const result = await action(...args);
			const duration = performance.now() - start;

			// Log slow actions (> 1000ms)
			if (duration > 1000) {
				console.warn(
					`Slow server action: ${actionName} (${duration.toFixed(2)}ms)`
				);
			}

			return result;
		} catch (error) {
			const duration = performance.now() - start;
			console.error(
				`Server action failed: ${actionName} (${duration.toFixed(2)}ms)`,
				error
			);
			throw error;
		}
	};
}

// React Query performance monitoring
export function createPerformanceQueryClient() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000, // 30 seconds
				gcTime: 5 * 60 * 1000, // 5 minutes
				retry: (failureCount: number, error: unknown) => {
					// Don't retry on authentication errors
					if (
						error instanceof Error &&
						error.message.includes('Unauthorized')
					) {
						return false;
					}
					return failureCount < 2;
				},
			},
			mutations: {
				retry: 1,
			},
		},
	});

	// Add global error handling
	queryClient.setMutationDefaults(['update-signup-status'], {
		onError: (error: unknown) => {
			console.error('Mutation error:', error);
		},
	});

	return queryClient;
}

// Web Vitals monitoring - disabled for now to avoid build issues
export function initWebVitals() {
	// Commented out to avoid web-vitals dependency issues
	// Can be enabled when web-vitals package is added
	/*
	if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
		import('web-vitals').then((webVitals) => {
			webVitals.getCLS?.(console.log);
			webVitals.getFID?.(console.log);
			webVitals.getFCP?.(console.log);
			webVitals.getLCP?.(console.log);
			webVitals.getTTFB?.(console.log);
		}).catch(() => {
			// web-vitals not installed, skip monitoring
		});
	}
	*/
}
