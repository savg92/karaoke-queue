/**
 * In-memory rate limiter for development/fallback when Redis is not available
 */
export class MemoryRateLimiter {
	private store = new Map<string, { count: number; resetTime: number }>();
	private maxRequests: number;
	private windowMs: number;

	constructor(maxRequests: number, windowMs: number) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;

		// Clean up expired entries every minute
		setInterval(() => this.cleanup(), 60000);
	}

	async limit(identifier: string) {
		const now = Date.now();
		const key = identifier;
		const entry = this.store.get(key);

		if (!entry || now > entry.resetTime) {
			// First request or window expired
			this.store.set(key, {
				count: 1,
				resetTime: now + this.windowMs,
			});

			return {
				success: true,
				limit: this.maxRequests,
				remaining: this.maxRequests - 1,
				reset: now + this.windowMs,
			};
		}

		if (entry.count >= this.maxRequests) {
			// Rate limit exceeded
			return {
				success: false,
				limit: this.maxRequests,
				remaining: 0,
				reset: entry.resetTime,
			};
		}

		// Increment count
		entry.count++;
		this.store.set(key, entry);

		return {
			success: true,
			limit: this.maxRequests,
			remaining: this.maxRequests - entry.count,
			reset: entry.resetTime,
		};
	}

	private cleanup() {
		const now = Date.now();
		for (const [key, entry] of this.store.entries()) {
			if (now > entry.resetTime) {
				this.store.delete(key);
			}
		}
	}
}
