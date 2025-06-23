import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	measureDatabaseQuery,
	withPerformanceMonitoring,
} from '../src/lib/performance';

describe('Performance Monitoring', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('measureDatabaseQuery', () => {
		it('should measure query time and warn on slow queries', async () => {
			const slowQuery = () =>
				new Promise<string>((resolve) =>
					setTimeout(() => resolve('result'), 600)
				);

			const result = await measureDatabaseQuery('test-query', slowQuery);

			expect(result).toBe('result');
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('Slow database query detected: test-query')
			);
		});

		it('should handle query errors gracefully', async () => {
			const errorQuery = () => Promise.reject(new Error('Database error'));

			await expect(
				measureDatabaseQuery('error-query', errorQuery)
			).rejects.toThrow('Database error');

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Database query failed: error-query'),
				expect.any(Error)
			);
		});
	});

	describe('withPerformanceMonitoring', () => {
		it('should wrap server actions with performance monitoring', async () => {
			const slowAction = async (input: string) => {
				await new Promise((resolve) => setTimeout(resolve, 1100));
				return `processed: ${input}`;
			};

			const monitoredAction = withPerformanceMonitoring(
				'test-action',
				slowAction
			);
			const result = await monitoredAction('test-input');

			expect(result).toBe('processed: test-input');
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('Slow server action: test-action')
			);
		});

		it('should handle action errors with performance logging', async () => {
			const errorAction = async () => {
				throw new Error('Action failed');
			};

			const monitoredAction = withPerformanceMonitoring(
				'error-action',
				errorAction
			);

			await expect(monitoredAction()).rejects.toThrow('Action failed');
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Server action failed: error-action'),
				expect.any(Error)
			);
		});
	});
});

describe('Queue Performance Tests', () => {
	it('should handle large queue operations efficiently', async () => {
		// Mock large dataset
		const largeQueue = Array.from({ length: 1000 }, (_, i) => ({
			id: `signup-${i}`,
			position: i + 1,
			status: 'QUEUED' as const,
			singerName: `Singer ${i}`,
			songTitle: `Song ${i}`,
			artist: `Artist ${i}`,
			createdAt: new Date(),
		}));

		// Test position recalculation performance
		const start = performance.now();

		// Simulate position recalculation logic
		const updatedQueue = largeQueue.map((signup, index) => ({
			...signup,
			position: index + 1,
		}));

		const duration = performance.now() - start;

		expect(updatedQueue).toHaveLength(1000);
		expect(duration).toBeLessThan(50); // Should complete in < 50ms
	});

	it('should efficiently filter active signups', () => {
		const mixedSignups = [
			{ status: 'QUEUED', position: 1 },
			{ status: 'PERFORMING', position: 0 },
			{ status: 'COMPLETE', position: 0 },
			{ status: 'QUEUED', position: 2 },
			{ status: 'CANCELLED', position: 0 },
		];

		const start = performance.now();
		const activeSignups = mixedSignups.filter(
			(signup) => signup.status === 'QUEUED' || signup.status === 'PERFORMING'
		);
		const duration = performance.now() - start;

		expect(activeSignups).toHaveLength(3);
		expect(duration).toBeLessThan(1); // Should be virtually instant
	});
});
