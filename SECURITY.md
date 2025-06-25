# Security System Documentation

This document explains the rate limiting and attack detection system implemented for the Karaoke Queue application.

## Overview

The security system provides protection against:

- **Rate limiting**: Prevents API abuse by limiting requests per time window
- **Brute force attacks**: Detects and blocks repeated failed attempts
- **Injection attacks**: Scans for SQL injection and XSS attempts
- **Bot detection**: Identifies and blocks automated requests
- **IP blocking**: Temporarily blocks suspicious clients

## Features Implemented

### 1. Rate Limiting

- **Public signup form**: 5 requests per minute per IP
- **Dashboard actions**: 30 requests per minute per user
- **Authentication**: 3 attempts per 15 minutes per IP
- **API endpoints**: 100 requests per minute per IP
- **YouTube search**: 20 searches per minute per IP

### 2. Attack Detection

- **Brute force protection**: Blocks IPs after 5 failed attempts (1 hour block)
- **Injection detection**: Scans form data for SQL injection and XSS patterns
- **Bot detection**: Identifies common bot user agents
- **Security event logging**: Tracks all security incidents

### 3. Fallback Support

- Works with Redis (recommended for production)
- Falls back to in-memory storage (development/testing)
- Graceful degradation when Redis is unavailable

## Setup

### Development (In-Memory)

No additional setup required. The system automatically uses in-memory storage.

### Production (Redis)

1. Set up Redis instance (recommend Upstash for serverless)
2. Add environment variables:
   ```bash
   UPSTASH_REDIS_REST_URL="your-redis-url"
   UPSTASH_REDIS_REST_TOKEN="your-redis-token"
   ```

## Usage

### Protecting Server Actions

```typescript
import { withSecurity } from '@/lib/security/security-wrapper';

const myAction = withSecurity(originalAction, {
	rateLimiter: 'dashboard',
	checkInjection: true,
});
```

### Protecting API Routes

```typescript
import {
	rateLimiters,
	getClientId,
	createRateLimitResponse,
} from '@/lib/security/rate-limit';
import { AttackDetector } from '@/lib/security/attack-detector';

export async function GET(request: NextRequest) {
	const clientId = getClientId(request);
	const detector = AttackDetector.getInstance();

	// Check if blocked
	if (await detector.isBlocked(clientId)) {
		return new Response('Forbidden', { status: 403 });
	}

	// Apply rate limiting
	const limit = await rateLimiters.api.limit(clientId);
	if (!limit.success) {
		return createRateLimitResponse(limit);
	}

	// Your API logic here...
}
```

### Security Monitoring

```typescript
import { getSecurityStats } from '@/components/security/SecurityStats';

const stats = await getSecurityStats();
// Returns: { blockedIps: number, recentEvents: {...} }
```

## Security Events

The system logs the following event types:

- `brute_force`: Multiple failed authentication attempts
- `suspicious_activity`: Bot detection or unusual behavior
- `rate_limit_exceeded`: API rate limits exceeded
- `injection_attempt`: SQL injection or XSS attempts detected

## Configuration

Rate limits can be adjusted in `/lib/security/rate-limit.ts`:

```typescript
signup: new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requests per minute
  analytics: true,
  prefix: 'rl:signup',
}),
```

## Best Practices

1. **Monitor security stats** regularly
2. **Adjust rate limits** based on usage patterns
3. **Set up Redis** for production deployments
4. **Review security logs** for patterns
5. **Update injection patterns** as needed

## Testing

The security system is automatically tested during the build process. All rate limiters include fallback mechanisms and graceful error handling.

## Troubleshooting

### Common Issues

1. **Rate limits too strict**: Adjust limits in rate-limit.ts
2. **False positive blocks**: Review injection detection patterns
3. **Redis connection errors**: Check environment variables
4. **Performance issues**: Monitor memory usage with fallback storage

### Debug Mode

Set `NODE_ENV=development` to see detailed security logs in the console.
