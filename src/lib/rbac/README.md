# Role Monitoring System

The karaoke queue application includes a comprehensive role monitoring and audit system that tracks user permissions, monitors security events, and provides administrators with detailed analytics about role usage and potential security threats.

## Overview

The role monitoring system is built around the `profiles.role` field in the database and provides:

- **Real-time Role Analytics**: Live monitoring of role distribution and usage patterns
- **Security Event Logging**: Comprehensive audit trail of all role-related activities
- **Suspicious Activity Detection**: Automated detection and blocking of potential security threats
- **User Management Interface**: Admin dashboard for managing user roles and permissions
- **Compliance Reporting**: Detailed reporting for audit and compliance requirements

## Database Schema

The system uses two main tables for role monitoring:

### `profiles` table

- Contains the primary `role` field that determines user permissions
- Roles: `SUPER_ADMIN`, `ADMIN`, `HOST`, `VIEWER`, `GUEST`

### `role_events` table

- Comprehensive audit log of all role-related activities
- Tracks event types, user actions, IP addresses, success/failure status
- Stores metadata for detailed forensic analysis

### Event Types

- `ROLE_ASSIGNED`: When a user's role is changed
- `ROLE_REVOKED`: When a role is removed
- `PERMISSION_GRANTED`: Successful access to protected resources
- `PERMISSION_DENIED`: Failed access attempts
- `UNAUTHORIZED_ACCESS`: Attempts to access forbidden resources
- `ROLE_ESCALATION_ATTEMPT`: Attempts to gain higher privileges

## Components

### Server Actions (`/src/app/actions/role-monitoring.ts`)

- `logRoleEvent()`: Log security events to the database
- `getRoleAnalytics()`: Fetch comprehensive role analytics
- `updateUserRole()`: Update user roles with audit logging
- `getAllUsersWithRoles()`: Get all users for management
- `checkSuspiciousActivity()`: Detect security threats

### Enhanced Role Monitoring Dashboard (`/src/components/rbac/EnhancedRoleMonitoringDashboard.tsx`)

- Real-time analytics display
- User role management interface
- Recent events monitoring
- Suspicious activity alerts
- Role distribution visualization

### Middleware Integration (`/src/middleware.ts`)

- Automatic security event logging
- Suspicious activity detection
- Request pattern analysis
- Attack prevention (SQL injection, path traversal)

### Admin Navigation (`/src/app/(dashboard)/components/AdminHeaderMenu.tsx`)

- Quick access to role monitoring
- Dialog-based quick view
- Full-page monitoring dashboard link

## Features

### 1. Real-time Role Analytics

- Total event count tracking
- Active user statistics
- Security violation alerts
- Top user activity metrics
- Role distribution charts

### 2. User Role Management

- Update user roles with audit trail
- Reason tracking for role changes
- Permission escalation prevention
- Bulk user operations

### 3. Security Monitoring

- Failed authentication tracking
- Suspicious IP address detection
- Role escalation attempt alerts
- Real-time violation notifications

### 4. Audit Trail

- Complete event history
- IP address and user agent logging
- Success/failure tracking
- Metadata storage for forensics

### 5. Suspicious Activity Detection

- SQL injection pattern detection
- Path traversal attempt blocking
- Bot access monitoring
- Brute force detection

## Usage

### For Administrators

#### Accessing Role Monitoring

1. Log in as `SUPER_ADMIN` or `ADMIN`
2. Click the "Admin" dropdown in the header
3. Select "Role Monitoring (Full Page)" for comprehensive view
4. Or select "Role Monitoring (Quick View)" for a dialog overlay

#### Managing User Roles

1. Navigate to the Role Monitoring dashboard
2. Find the user in the "User Management" section
3. Click "Edit Role" to update their permissions
4. Provide a reason for the change (recommended)
5. Confirm the update

#### Monitoring Security Events

1. Check the "Recent Role Events" table for latest activity
2. Monitor the "Suspicious Activity" section for threats
3. Review failed attempts and escalation attempts
4. Investigate unusual patterns in user behavior

### For Developers

#### Logging Custom Events

```typescript
import { logRoleEvent } from '@/app/actions/role-monitoring';
import { RoleEventType, UserRole } from '@prisma/client';

await logRoleEvent(RoleEventType.PERMISSION_GRANTED, userId, UserRole.HOST, {
	success: true,
	metadata: {
		action: 'custom_action',
		details: 'additional_context',
	},
});
```

#### Checking User Analytics

```typescript
import { getRoleAnalytics } from '@/app/actions/role-monitoring';

const analytics = await getRoleAnalytics();
console.log('Total events:', analytics.totalEvents);
console.log('Role distribution:', analytics.roleDistribution);
```

## Security Features

### Automatic Threat Detection

The middleware automatically detects and logs:

- SQL injection attempts
- Path traversal attacks
- Bot access to admin areas
- Multiple failed authentication attempts

### Role Escalation Prevention

- Non-super-admins cannot assign `SUPER_ADMIN` role
- All role changes are logged with audit trail
- Failed escalation attempts trigger security alerts

### IP-based Monitoring

- Track suspicious IP addresses
- Detect multiple failed attempts from same IP
- Automatic blocking of obvious attacks

## Configuration

### Environment Variables

No additional environment variables required - uses existing database connection.

### Database Setup

Tables are automatically created via Prisma migrations:

```bash
bunx prisma db push
```

### Access Control

- Role monitoring dashboard: `SUPER_ADMIN` and `ADMIN` only
- User role updates: `SUPER_ADMIN` and `ADMIN` only
- Analytics viewing: `SUPER_ADMIN` and `ADMIN` only

## Performance Considerations

### Query Optimization

- Database queries use proper indexing
- Paginated results for large datasets
- Efficient aggregation for analytics

### Real-time Updates

- React Query for caching and invalidation
- 30-second refresh intervals for analytics
- 60-second refresh for user lists
- Real-time suspicious activity detection

### Memory Management

- Limited event retention in memory
- Database-based persistence
- Efficient JSON metadata storage

## Compliance and Audit

### Audit Trail Requirements

- All role changes logged with timestamps
- IP address and user agent tracking
- Reason codes for role modifications
- Complete event history preservation

### Reporting Features

- Role distribution reports
- Security incident summaries
- User activity analytics
- Compliance violation tracking

### Data Retention

- Events stored indefinitely in database
- Configurable cleanup procedures
- Export capabilities for archival

## Troubleshooting

### Common Issues

#### Role Changes Not Reflected

- Check if user has logged out and back in
- Verify database connection
- Check for caching issues in React Query

#### Missing Security Events

- Verify middleware is properly configured
- Check database write permissions
- Ensure proper error handling in logging

#### Performance Issues

- Review query patterns in analytics
- Check for proper indexing on role_events table
- Monitor memory usage in production

### Debug Tools

- Use Prisma Studio to inspect role_events table
- Check browser console for client-side errors
- Monitor server logs for security events

## Future Enhancements

### Planned Features

- Email notifications for security events
- Advanced threat intelligence
- Machine learning for anomaly detection
- Integration with external security systems
- Advanced reporting dashboards

### API Endpoints

- REST API for external integrations
- Webhook support for real-time alerts
- GraphQL interface for complex queries

This role monitoring system provides enterprise-grade security and audit capabilities while remaining easy to use and maintain.
