// This file contains the fairness algorithm for determining queue positions.
// The algorithm ensures that singers are distributed fairly throughout the queue,
// preventing any single person from monopolizing the event.

export interface QueueEntry {
	id: string;
	singerName: string;
	queuePosition: number;
	createdAt: Date;
}

/**
 * Calculates the optimal queue position for a new singer based on fairness principles.
 *
 * The fairness algorithm works as follows:
 * 1. If the queue is empty, place the singer at position 1
 * 2. If the singer hasn't sung before, place them after existing singers who also haven't sung
 * 3. If the singer has sung before, place them at the end of the queue
 * 4. Maintain chronological order for singers with the same singing history
 *
 * @param currentQueue - Array of current queue entries, ordered by queuePosition
 * @param singerName - Name of the singer being added
 * @returns The optimal queue position for the new singer
 */
export function calculateQueuePosition(
	currentQueue: QueueEntry[],
	singerName: string
): number {
	// If the queue is empty, start at position 1
	if (currentQueue.length === 0) {
		return 1;
	}

	// Check if this singer has already sung before
	const previousPerformances = currentQueue.filter(
		(entry) => entry.singerName.toLowerCase() === singerName.toLowerCase()
	);

	// If this is their first performance, insert them after other first-time singers
	if (previousPerformances.length === 0) {
		// Find all singers and count their previous performances
		const singerCounts = new Map<string, number>();

		currentQueue.forEach((entry) => {
			const normalizedName = entry.singerName.toLowerCase();
			singerCounts.set(
				normalizedName,
				(singerCounts.get(normalizedName) || 0) + 1
			);
		});

		// Find the last position of singers with only 1 performance
		let lastFirstTimerPosition = 0;

		for (const entry of currentQueue) {
			const normalizedName = entry.singerName.toLowerCase();
			const performanceCount = singerCounts.get(normalizedName) || 0;

			if (performanceCount === 1) {
				lastFirstTimerPosition = entry.queuePosition;
			}
		}

		// Place the new singer after the last first-timer
		return lastFirstTimerPosition + 1;
	}

	// If they've sung before, place them at the end of the queue
	const maxPosition = Math.max(
		...currentQueue.map((entry) => entry.queuePosition)
	);
	return maxPosition + 1;
}

/**
 * Rebalances the entire queue to ensure fairness.
 * This function can be called periodically to maintain optimal queue ordering.
 *
 * @param currentQueue - Array of current queue entries
 * @returns Reordered queue with updated positions
 */
export function rebalanceQueue(currentQueue: QueueEntry[]): QueueEntry[] {
	// Group singers by their performance count
	const singerCounts = new Map<string, number>();
	const singerFirstSeen = new Map<string, Date>();

	currentQueue.forEach((entry) => {
		const normalizedName = entry.singerName.toLowerCase();
		singerCounts.set(
			normalizedName,
			(singerCounts.get(normalizedName) || 0) + 1
		);

		const existingFirstSeen = singerFirstSeen.get(normalizedName);
		if (!existingFirstSeen || entry.createdAt < existingFirstSeen) {
			singerFirstSeen.set(normalizedName, entry.createdAt);
		}
	});

	// Sort entries by fairness rules
	const reorderedQueue = [...currentQueue].sort((a, b) => {
		const aName = a.singerName.toLowerCase();
		const bName = b.singerName.toLowerCase();
		const aCount = singerCounts.get(aName) || 0;
		const bCount = singerCounts.get(bName) || 0;

		// First-time singers come before repeat singers
		if (aCount !== bCount) {
			return aCount - bCount;
		}

		// Within the same performance count, sort by creation time
		return a.createdAt.getTime() - b.createdAt.getTime();
	});

	// Update queue positions
	return reorderedQueue.map((entry, index) => ({
		...entry,
		queuePosition: index + 1,
	}));
}

/**
 * Recalculates queue positions for all active (QUEUED and PERFORMING) signups.
 * This should be called after status changes to maintain correct positioning.
 *
 * @param allSignups - All signups for the event
 * @returns Updated signups with correct positions
 */
export function recalculateQueuePositions(
	allSignups: QueueEntry[]
): QueueEntry[] {
	// Note: This function assumes all passed signups are already filtered to active ones
	// Actual filtering should be done at the database level in the calling code

	// Sort by original creation time to maintain fairness
	const sortedSignups = [...allSignups].sort(
		(a, b) => a.createdAt.getTime() - b.createdAt.getTime()
	);

	// Reassign positions sequentially starting from 1
	return sortedSignups.map((signup, index) => ({
		...signup,
		queuePosition: index + 1,
	}));
}
