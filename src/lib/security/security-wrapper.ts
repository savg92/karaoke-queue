import { headers } from 'next/headers';
import { rateLimiters, getClientId } from './rate-limit';
import { AttackDetector } from './attack-detector';

export interface SecurityOptions {
	rateLimiter?: keyof typeof rateLimiters;
	checkInjection?: boolean;
	requireAuth?: boolean;
}

/**
 * Security wrapper for server actions
 * Applies rate limiting, injection detection, and other security measures
 */
export function withSecurity<T extends unknown[], R>(
	action: (...args: T) => Promise<R>,
	options: SecurityOptions = {}
): (...args: T) => Promise<R> {
	return async (...args: T): Promise<R> => {
		const headersList = await headers();
		const detector = AttackDetector.getInstance();

		// Create a mock request object for getClientId
		const mockRequest = {
			headers: {
				get: (name: string) => headersList.get(name),
			},
		} as Request;

		const clientId = getClientId(mockRequest);

		// Check if client is blocked
		if (await detector.isBlocked(clientId)) {
			throw new Error('Access denied');
		}

		// Apply rate limiting if specified
		if (options.rateLimiter) {
			const limiter = rateLimiters[options.rateLimiter];
			const limit = await limiter.limit(clientId);

			if (!limit.success) {
				await detector.logSecurityEvent({
					type: 'rate_limit_exceeded',
					clientId,
					timestamp: Date.now(),
					details: { action: action.name, limiter: options.rateLimiter },
				});
				throw new Error('Rate limit exceeded. Please try again later.');
			}
		}

		// Check for injection attempts in arguments
		if (options.checkInjection) {
			for (const arg of args) {
				if (typeof arg === 'object' && arg !== null) {
					if (
						detector.detectInjectionAttempts(arg as Record<string, unknown>)
					) {
						await detector.logSecurityEvent({
							type: 'injection_attempt',
							clientId,
							timestamp: Date.now(),
							details: { action: action.name },
						});

						// Block client for injection attempts
						await detector.blockClient(clientId, 7200); // 2 hours
						throw new Error('Invalid input detected');
					}
				}
			}
		}

		// Check for suspicious activity
		const userAgent = headersList.get('user-agent') || undefined;
		if (await detector.checkSuspiciousActivity(clientId, userAgent)) {
			throw new Error('Suspicious activity detected');
		}

		// Execute the original action
		return await action(...args);
	};
}

/**
 * Decorator for server actions that need security protection
 */
export function secured(options: SecurityOptions = {}) {
	return function <T extends unknown[], R>(
		target: object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
	) {
		if (!descriptor.value) return;

		const originalMethod = descriptor.value;
		descriptor.value = withSecurity(originalMethod, options);
	};
}
