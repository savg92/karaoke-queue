import { describe, it, expect } from 'vitest';
import { calculateQueuePosition, type QueueEntry } from '@/lib/queue-logic';

describe('Queue Logic - Fairness Algorithm', () => {
	it('should assign position 1 for first signup', () => {
		const existingSignups: QueueEntry[] = [];
		const singerName = 'John Doe';

		const position = calculateQueuePosition(existingSignups, singerName);
		expect(position).toBe(1);
	});

	it('should assign next position when no repeats', () => {
		const existingSignups: QueueEntry[] = [
			{
				id: '1',
				singerName: 'Alice',
				queuePosition: 1,
				createdAt: new Date('2023-01-01T10:00:00Z'),
			},
			{
				id: '2',
				singerName: 'Bob',
				queuePosition: 2,
				createdAt: new Date('2023-01-01T10:01:00Z'),
			},
		];

		const position = calculateQueuePosition(existingSignups, 'Charlie');
		expect(position).toBe(3);
	});

	it('should implement fairness algorithm for repeat singers', () => {
		const existingSignups: QueueEntry[] = [
			{
				id: '1',
				singerName: 'Alice',
				queuePosition: 1,
				createdAt: new Date('2023-01-01T10:00:00Z'),
			},
			{
				id: '2',
				singerName: 'Bob',
				queuePosition: 2,
				createdAt: new Date('2023-01-01T10:01:00Z'),
			},
			{
				id: '3',
				singerName: 'Charlie',
				queuePosition: 3,
				createdAt: new Date('2023-01-01T10:02:00Z'),
			},
		];

		// Alice signs up again - should go to the end
		const position = calculateQueuePosition(existingSignups, 'Alice');
		expect(position).toBe(4);
	});

	it('should place first-time singers before repeat singers', () => {
		const existingSignups: QueueEntry[] = [
			{
				id: '1',
				singerName: 'Alice',
				queuePosition: 1,
				createdAt: new Date('2023-01-01T10:00:00Z'),
			},
			// Alice singing again
			{
				id: '2',
				singerName: 'Alice',
				queuePosition: 2,
				createdAt: new Date('2023-01-01T10:01:00Z'),
			},
			{
				id: '3',
				singerName: 'Bob',
				queuePosition: 3,
				createdAt: new Date('2023-01-01T10:02:00Z'),
			},
		];

		// Charlie (first time) should be placed after Bob (first time) but before Alice's repeat
		const position = calculateQueuePosition(existingSignups, 'Charlie');
		expect(position).toBe(4); // After Bob's first performance
	});

	it('should handle case-insensitive singer names', () => {
		const existingSignups: QueueEntry[] = [
			{
				id: '1',
				singerName: 'alice',
				queuePosition: 1,
				createdAt: new Date('2023-01-01T10:00:00Z'),
			},
		];

		const position = calculateQueuePosition(existingSignups, 'ALICE');
		expect(position).toBe(2); // Should be treated as repeat singer
	});

	it('should handle empty queue correctly', () => {
		const existingSignups: QueueEntry[] = [];
		const position = calculateQueuePosition(existingSignups, 'First Singer');
		expect(position).toBe(1);
	});
});
