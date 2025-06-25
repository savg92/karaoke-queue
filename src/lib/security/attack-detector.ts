import { Redis } from '@upstash/redis';

const hasRedis =
	process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = hasRedis ? Redis.fromEnv() : null;

export interface SecurityEvent {
	type:
		| 'brute_force'
		| 'suspicious_activity'
		| 'rate_limit_exceeded'
		| 'injection_attempt';
	clientId: string;
	timestamp: number;
	details?: Record<string, unknown>;
}

export class AttackDetector {
	private static instance: AttackDetector;
	private redis: Redis | null;
	private memoryStore = new Map<
		string,
		{ data: string | number; expiry: number }
	>(); // Fallback for when Redis is not available

	private constructor() {
		this.redis = redis;
	}

	public static getInstance(): AttackDetector {
		if (!AttackDetector.instance) {
			AttackDetector.instance = new AttackDetector();
		}
		return AttackDetector.instance;
	}

	// Log security events
	async logSecurityEvent(event: SecurityEvent): Promise<void> {
		const key = `security:${event.clientId}:${event.type}`;
		const eventData = JSON.stringify(event);

		if (this.redis) {
			// Store event with 24 hour expiry
			await this.redis.setex(key, 86400, eventData);

			// Add to recent events list
			const recentKey = `security:recent:${event.type}`;
			await this.redis.lpush(recentKey, eventData);
			await this.redis.ltrim(recentKey, 0, 99); // Keep last 100 events
			await this.redis.expire(recentKey, 86400);
		} else {
			// Fallback to memory store
			this.memoryStore.set(key, {
				data: eventData,
				expiry: Date.now() + 86400000,
			});
			console.warn(
				'Security event logged to memory (Redis not available):',
				event
			);
		}
	}

	// Check if IP is blocked
	async isBlocked(clientId: string): Promise<boolean> {
		const blockKey = `security:blocked:${clientId}`;

		if (this.redis) {
			const blocked = await this.redis.get(blockKey);
			return blocked === 'true';
		} else {
			// Fallback to memory store
			const entry = this.memoryStore.get(blockKey);
			return Boolean(
				entry && entry.expiry > Date.now() && entry.data === 'true'
			);
		}
	}

	// Block IP for specified duration
	async blockClient(
		clientId: string,
		durationSeconds: number = 3600
	): Promise<void> {
		const blockKey = `security:blocked:${clientId}`;

		if (this.redis) {
			await this.redis.setex(blockKey, durationSeconds, 'true');
		} else {
			// Fallback to memory store
			this.memoryStore.set(blockKey, {
				data: 'true',
				expiry: Date.now() + durationSeconds * 1000,
			});
		}

		await this.logSecurityEvent({
			type: 'suspicious_activity',
			clientId,
			timestamp: Date.now(),
			details: { action: 'blocked', duration: durationSeconds },
		});
	}

	// Detect brute force attempts
	async detectBruteForce(clientId: string, action: string): Promise<boolean> {
		const key = `security:attempts:${clientId}:${action}`;

		let attempts: number;

		if (this.redis) {
			attempts = await this.redis.incr(key);

			if (attempts === 1) {
				// Set 15 minute expiry on first attempt
				await this.redis.expire(key, 900);
			}
		} else {
			// Fallback to memory store
			const entry = this.memoryStore.get(key);
			const now = Date.now();

			if (!entry || entry.expiry < now) {
				attempts = 1;
				this.memoryStore.set(key, {
					data: attempts,
					expiry: now + 900000, // 15 minutes
				});
			} else {
				attempts = (typeof entry.data === 'number' ? entry.data : 0) + 1;
				entry.data = attempts;
			}
		}

		// Block after 5 failed attempts
		if (attempts >= 5) {
			await this.blockClient(clientId, 3600); // Block for 1 hour

			await this.logSecurityEvent({
				type: 'brute_force',
				clientId,
				timestamp: Date.now(),
				details: { action, attempts },
			});

			return true;
		}

		return false;
	}

	// Detect injection attempts in form data
	detectInjectionAttempts(data: Record<string, unknown>): boolean {
		const injectionPatterns = [
			/(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b).*\bfrom\b/i,
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			/javascript:/i,
			/on\w+\s*=/i,
			/\b(eval|function)\s*\(/i,
		];

		for (const [, value] of Object.entries(data)) {
			if (typeof value === 'string') {
				for (const pattern of injectionPatterns) {
					if (pattern.test(value)) {
						return true;
					}
				}
			}
		}

		return false;
	}

	// Check for suspicious activity patterns
	async checkSuspiciousActivity(
		clientId: string,
		userAgent?: string
	): Promise<boolean> {
		// Check for common bot patterns
		if (userAgent) {
			const botPatterns = [
				/bot/i,
				/crawler/i,
				/spider/i,
				/scraper/i,
				/curl/i,
				/wget/i,
			];

			if (botPatterns.some((pattern) => pattern.test(userAgent))) {
				await this.logSecurityEvent({
					type: 'suspicious_activity',
					clientId,
					timestamp: Date.now(),
					details: { userAgent, reason: 'bot_detected' },
				});
				return true;
			}
		}

		return false;
	}

	// Get security stats
	async getSecurityStats(): Promise<{
		blockedIps: number;
		recentEvents: Record<string, number>;
	}> {
		if (this.redis) {
			const [blockedKeys, ...eventCounts] = await Promise.all([
				this.redis.keys('security:blocked:*'),
				this.redis.llen('security:recent:brute_force'),
				this.redis.llen('security:recent:suspicious_activity'),
				this.redis.llen('security:recent:rate_limit_exceeded'),
				this.redis.llen('security:recent:injection_attempt'),
			]);

			return {
				blockedIps: blockedKeys.length,
				recentEvents: {
					brute_force: eventCounts[0] || 0,
					suspicious_activity: eventCounts[1] || 0,
					rate_limit_exceeded: eventCounts[2] || 0,
					injection_attempt: eventCounts[3] || 0,
				},
			};
		} else {
			// Fallback to memory store
			const now = Date.now();
			let blockedCount = 0;

			for (const [key, entry] of this.memoryStore.entries()) {
				if (key.startsWith('security:blocked:') && entry.expiry > now) {
					blockedCount++;
				}
			}

			return {
				blockedIps: blockedCount,
				recentEvents: {
					brute_force: 0,
					suspicious_activity: 0,
					rate_limit_exceeded: 0,
					injection_attempt: 0,
				},
			};
		}
	}
}
