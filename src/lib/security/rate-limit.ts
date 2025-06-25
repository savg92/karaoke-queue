import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { MemoryRateLimiter } from './memory-rate-limiter';

// Check if Redis credentials are available
const hasRedis =
	process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis instance for rate limiting (if available)
const redis = hasRedis ? Redis.fromEnv() : null;

// Fallback rate limiters for development
const memoryLimiters = {
	signup: new MemoryRateLimiter(5, 60000), // 5 requests per minute
	dashboard: new MemoryRateLimiter(30, 60000), // 30 requests per minute
	auth: new MemoryRateLimiter(3, 900000), // 3 attempts per 15 minutes
	api: new MemoryRateLimiter(100, 60000), // 100 requests per minute
	youtube: new MemoryRateLimiter(20, 60000), // 20 searches per minute
};

// Rate limiting configurations for different endpoints
export const rateLimiters = hasRedis
	? {
			// Public signup form - strict limits to prevent spam
			signup: new Ratelimit({
				redis: redis!,
				limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requests per minute
				analytics: true,
				prefix: 'rl:signup',
			}),

			// Dashboard actions - moderate limits for authenticated users
			dashboard: new Ratelimit({
				redis: redis!,
				limiter: Ratelimit.slidingWindow(30, '60 s'), // 30 requests per minute
				analytics: true,
				prefix: 'rl:dashboard',
			}),

			// Authentication attempts - strict limits to prevent brute force
			auth: new Ratelimit({
				redis: redis!,
				limiter: Ratelimit.slidingWindow(3, '900 s'), // 3 attempts per 15 minutes
				analytics: true,
				prefix: 'rl:auth',
			}),

			// API endpoints - general rate limiting
			api: new Ratelimit({
				redis: redis!,
				limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 requests per minute
				analytics: true,
				prefix: 'rl:api',
			}),

			// YouTube search - moderate limits to respect API quotas
			youtube: new Ratelimit({
				redis: redis!,
				limiter: Ratelimit.slidingWindow(20, '60 s'), // 20 searches per minute
				analytics: true,
				prefix: 'rl:youtube',
			}),
	  }
	: memoryLimiters;

// Helper function to get client identifier
export function getClientId(request: Request): string {
	// Try to get IP from various headers (Vercel, Cloudflare, etc.)
	const forwarded = request.headers.get('x-forwarded-for');
	const realIp = request.headers.get('x-real-ip');
	const ip = forwarded?.split(',')[0] || realIp || 'unknown';

	return ip;
}

// Rate limit response helper
export function createRateLimitResponse(limit: {
	success: boolean;
	limit: number;
	remaining: number;
	reset: number;
}) {
	return new Response(
		JSON.stringify({
			error: 'Too many requests',
			message: 'Please try again later',
			retryAfter: Math.round(limit.reset / 1000),
		}),
		{
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				'Retry-After': Math.round(limit.reset / 1000).toString(),
				'X-RateLimit-Limit': limit.limit.toString(),
				'X-RateLimit-Remaining': limit.remaining.toString(),
				'X-RateLimit-Reset': limit.reset.toString(),
			},
		}
	);
}
