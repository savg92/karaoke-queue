# Role-Based Access Control (RBAC) System

## Overview

The Karaoke Queue application implements a comprehensive Role-Based Access Control (RBAC) system with monitoring and audit capabilities. This system provides fine-grained permissions, hierarchical roles, and comprehensive tracking of all role-related activities.

## Role Hierarchy

The system defines five distinct roles in a hierarchical structure:

### 1. Super Admin (Level 100)

- **Full system access** - Can perform any action
- **User management** - Create, update, delete users
- **System administration** - Manage system settings and security
- **Organization oversight** - Manage all organizations
- **Complete audit access** - View all logs and analytics

### 2. Admin (Level 80)

- **Organization management** - Create and manage organizations
- **User administration** - Manage users within scope
- **Event oversight** - Full event management capabilities
- **Analytics access** - View comprehensive analytics
- **Audit permissions** - Access to audit logs

### 3. Host (Level 60)

- **Event management** - Create and manage own events
- **Queue control** - Full queue management capabilities
- **Attendee management** - Add, edit, remove attendees
- **Limited analytics** - View event-specific analytics

### 4. Viewer (Level 40)

- **Read-only access** - View events and queues
- **Basic analytics** - Limited analytics access
- **No modification rights** - Cannot change data

### 5. Guest (Level 20)

- **Public access only** - View public events
- **Signup capability** - Can join karaoke queues
- **No administrative access**

## Permission System

### Core Permissions

#### Event Management

- `CREATE_EVENT` - Create new events
- `UPDATE_EVENT` - Modify existing events
- `DELETE_EVENT` - Remove events
- `VIEW_EVENT` - View event details
- `MANAGE_EVENT_SETTINGS` - Configure event settings

#### Queue Management

- `ADD_SINGER` - Add singers to queue
- `REMOVE_SINGER` - Remove singers from queue
- `UPDATE_SINGER_STATUS` - Change singer status
- `REORDER_QUEUE` - Rearrange queue order
- `VIEW_QUEUE` - View queue status
- `MANAGE_QUEUE` - Full queue control

#### User Management

- `CREATE_USER` - Create new users
- `UPDATE_USER` - Modify user information
- `DELETE_USER` - Remove users
- `VIEW_USERS` - View user lists
- `ASSIGN_ROLES` - Grant/revoke roles

#### System Administration

- `VIEW_ANALYTICS` - Access analytics data
- `MANAGE_SYSTEM_SETTINGS` - System configuration
- `VIEW_AUDIT_LOGS` - Access audit trails
- `MANAGE_SECURITY` - Security configuration

#### Organization Management

- `CREATE_ORGANIZATION` - Create organizations
- `UPDATE_ORGANIZATION` - Modify organizations
- `DELETE_ORGANIZATION` - Remove organizations
- `VIEW_ORGANIZATION` - View organization data

## Role Monitoring System

### Event Tracking

The system automatically tracks all role-related activities:

#### Event Types

- **ROLE_ASSIGNED** - When roles are granted
- **ROLE_REVOKED** - When roles are removed
- **PERMISSION_GRANTED** - Successful permission checks
- **PERMISSION_DENIED** - Failed permission checks
- **UNAUTHORIZED_ACCESS** - Access attempts without permission
- **ROLE_ESCALATION_ATTEMPT** - Attempts to gain higher privileges

#### Tracked Information

- User ID and role
- Timestamp and IP address
- User agent and session context
- Permission attempted
- Success/failure status
- Additional metadata

### Security Violation Detection

#### Automatic Detection

- **Brute Force** - Multiple failed attempts
- **Role Escalation** - Attempting higher privileges
- **Suspicious Activity** - Unusual access patterns
- **Session Anomalies** - Irregular session behavior

#### Violation Severity Levels

- **CRITICAL** - Immediate threat requiring action
- **HIGH** - Significant security concern
- **MEDIUM** - Moderate risk requiring monitoring
- **LOW** - Minor issue for logging

### Analytics and Reporting

#### Real-time Monitoring

- Active violation tracking
- Permission usage statistics
- Role distribution analysis
- User activity patterns

#### Compliance Reporting

- Role change history
- Access audit trails
- Violation resolution tracking
- Performance metrics

## Implementation

### Core Classes

#### `RBACChecker`

Central permission validation class with methods:

- `hasPermission()` - Check single permission
- `hasAnyPermission()` - Check multiple permissions (OR)
- `canAssignRole()` - Validate role assignments
- `enforcePermission()` - Throw on permission failure

#### `RoleMonitor`

Event tracking and analytics system:

- `logEvent()` - Record role activities
- `getAnalytics()` - Retrieve usage statistics
- `getViolations()` - Access security violations
- `getComplianceReport()` - Generate audit reports

### React Integration

#### `usePermissions` Hook

Convenient React hook for component-level permission checks:

```typescript
const { hasPermission, canAssignRole } = usePermissions(userRole, context);

if (hasPermission(Permission.MANAGE_QUEUE)) {
	// Show queue management UI
}
```

#### `RoleMonitoringDashboard` Component

Administrative interface showing:

- Real-time role analytics
- Security violation alerts
- User activity monitoring
- Compliance reporting

### Usage Examples

#### Server Action Protection

```typescript
// In server actions
RBACChecker.enforcePermission(
	userRole,
	Permission.ADD_SINGER,
	{ eventId },
	{ userId, ipAddress, logEvent: true }
);
```

#### Component Protection

```typescript
// In React components
const permissions = usePermissions(userRole, { eventId });

if (permissions.hasPermission(Permission.MANAGE_QUEUE)) {
	return <QueueManagementPanel />;
}
```

#### Role Assignment Validation

```typescript
// Before assigning roles
if (RBACChecker.canAssignRole(currentUserRole, targetRole)) {
	await assignRole(userId, targetRole);
}
```

## Security Features

### Access Control

- **Hierarchical validation** - Higher roles inherit lower permissions
- **Context-aware checks** - Event and organization scoping
- **Automatic logging** - All permission checks tracked

### Monitoring

- **Real-time violation detection** - Immediate threat identification
- **Pattern analysis** - Behavioral anomaly detection
- **Audit trails** - Complete activity history

### Compliance

- **Data retention** - Configurable log retention periods
- **Automated cleanup** - Old event removal
- **Export capabilities** - Compliance report generation

## Configuration

### Environment Variables

```bash
# RBAC monitoring settings
RBAC_LOG_RETENTION_DAYS=90
RBAC_VIOLATION_THRESHOLD=5
RBAC_MONITORING_ENABLED=true
```

### Role Assignment

Roles are assigned through the administrative interface or programmatically:

```typescript
// Programmatic role assignment
await assignUserRole(userId, UserRole.HOST, { eventId });
```

## Best Practices

### Security

1. **Principle of Least Privilege** - Grant minimum required permissions
2. **Regular Audits** - Review role assignments periodically
3. **Violation Monitoring** - Investigate security violations promptly
4. **Session Management** - Implement proper session timeouts

### Development

1. **Permission Checks** - Always verify permissions before actions
2. **Context Awareness** - Use appropriate context for checks
3. **Error Handling** - Provide meaningful error messages
4. **Testing** - Test permission scenarios thoroughly

### Monitoring

1. **Dashboard Review** - Regular monitoring dashboard checks
2. **Violation Resolution** - Timely resolution of security issues
3. **Analytics Analysis** - Use analytics for system optimization
4. **Compliance Reporting** - Generate regular compliance reports

## Migration and Maintenance

### Data Migration

The system includes utilities for migrating existing user data to the RBAC structure.

### Maintenance Tasks

- **Log cleanup** - Automatic removal of old logs
- **Analytics optimization** - Performance tuning
- **Security updates** - Regular security enhancements

This RBAC system provides enterprise-grade access control with comprehensive monitoring and audit capabilities, ensuring secure and compliant operation of the Karaoke Queue application.
