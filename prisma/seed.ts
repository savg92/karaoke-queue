import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Clear existing data
	console.log('🧹 Clearing existing data...');
	await prisma.roleEvent.deleteMany();
	await prisma.roleAssignment.deleteMany();
	await prisma.signup.deleteMany();
	await prisma.event.deleteMany();
	await prisma.profile.deleteMany();

	// Create a test profile with an email you can access
	const profile = await prisma.profile.create({
		data: {
			email: '1992savg@gmail.com',
			givenName: 'Test',
			familyName: 'Host',
		},
	});

	// Create additional test users for different roles
	const adminProfile = await prisma.profile.create({
		data: {
			email: 'admin@example.com',
			givenName: 'Admin',
			familyName: 'User',
		},
	});

	const hostProfile = await prisma.profile.create({
		data: {
			email: 'host@example.com',
			givenName: 'Event',
			familyName: 'Host',
		},
	});

	const kamburcitoProfile = await prisma.profile.create({
		data: {
			email: 'kamburcito@gmail.com',
			givenName: 'Kamburcito',
			familyName: 'Host',
		},
	});

	const viewerProfile = await prisma.profile.create({
		data: {
			email: 'viewer@example.com',
			givenName: 'Viewer',
			familyName: 'User',
		},
	});

	console.log('👤 Created user profiles');

	console.log('🔒 Assigning RBAC roles and logging events...');

	// Make the main user a Super Admin (global scope)
	await prisma.roleAssignment.create({
		data: {
			userId: profile.id,
			role: 'SUPER_ADMIN',
			scope: 'GLOBAL',
			assignedBy: profile.id, // Self-assigned for seeding
			isActive: true,
		},
	});

	// Log role assignment event
	await prisma.roleEvent.create({
		data: {
			eventType: 'ROLE_ASSIGNED',
			userId: profile.id,
			role: 'SUPER_ADMIN',
			success: true,
			ipAddress: '127.0.0.1',
			userAgent: 'Seed Script',
			metadata: { assignedBy: profile.id, scope: 'GLOBAL' },
		},
	});

	// Make admin user an Admin (global scope)
	await prisma.roleAssignment.create({
		data: {
			userId: adminProfile.id,
			role: 'ADMIN',
			scope: 'GLOBAL',
			assignedBy: profile.id,
			isActive: true,
		},
	});

	// Log role assignment event
	await prisma.roleEvent.create({
		data: {
			eventType: 'ROLE_ASSIGNED',
			userId: adminProfile.id,
			role: 'ADMIN',
			success: true,
			ipAddress: '127.0.0.1',
			userAgent: 'Seed Script',
			metadata: { assignedBy: profile.id, scope: 'GLOBAL' },
		},
	});

	// Make host user a Host (global scope for this demo)
	await prisma.roleAssignment.create({
		data: {
			userId: hostProfile.id,
			role: 'HOST',
			scope: 'GLOBAL',
			assignedBy: profile.id,
			isActive: true,
		},
	});

	// Log role assignment event
	await prisma.roleEvent.create({
		data: {
			eventType: 'ROLE_ASSIGNED',
			userId: hostProfile.id,
			role: 'HOST',
			success: true,
			ipAddress: '127.0.0.1',
			userAgent: 'Seed Script',
			metadata: { assignedBy: profile.id, scope: 'GLOBAL' },
		},
	});

	// Make kamburcito user a Host (global scope)
	await prisma.roleAssignment.create({
		data: {
			userId: kamburcitoProfile.id,
			role: 'HOST',
			scope: 'GLOBAL',
			assignedBy: profile.id,
			isActive: true,
		},
	});

	// Log role assignment event
	await prisma.roleEvent.create({
		data: {
			eventType: 'ROLE_ASSIGNED',
			userId: kamburcitoProfile.id,
			role: 'HOST',
			success: true,
			ipAddress: '127.0.0.1',
			userAgent: 'Seed Script',
			metadata: { assignedBy: profile.id, scope: 'GLOBAL' },
		},
	});

	// Make viewer user a Viewer (global scope)
	await prisma.roleAssignment.create({
		data: {
			userId: viewerProfile.id,
			role: 'VIEWER',
			scope: 'GLOBAL',
			assignedBy: profile.id,
			isActive: true,
		},
	});

	// Log role assignment event
	await prisma.roleEvent.create({
		data: {
			eventType: 'ROLE_ASSIGNED',
			userId: viewerProfile.id,
			role: 'VIEWER',
			success: true,
			ipAddress: '127.0.0.1',
			userAgent: 'Seed Script',
			metadata: { assignedBy: profile.id, scope: 'GLOBAL' },
		},
	});

	// Add some sample security events for demonstration
	await prisma.roleEvent.create({
		data: {
			eventType: 'UNAUTHORIZED_ACCESS',
			userId: viewerProfile.id,
			role: 'VIEWER',
			permission: 'DELETE_SIGNUP',
			success: false,
			ipAddress: '192.168.1.100',
			userAgent: 'Mozilla/5.0 (Test Browser)',
			metadata: { attemptedAction: 'delete_signup', signupId: 'fake-id' },
		},
	});

	await prisma.roleEvent.create({
		data: {
			eventType: 'PERMISSION_GRANTED',
			userId: hostProfile.id,
			role: 'HOST',
			permission: 'MANAGE_QUEUE',
			success: true,
			ipAddress: '10.0.0.5',
			userAgent: 'Mozilla/5.0 (Secure Browser)',
			metadata: { action: 'reorder_queue', eventId: 'will-be-created' },
		},
	});

	// Create a test event
	const event = await prisma.event.upsert({
		where: { slug: 'test-event' },
		update: {},
		create: {
			name: 'Test Karaoke Night',
			slug: 'test-event',
			description: 'A test karaoke event',
			date: new Date(),
			hostId: profile.id,
		},
	});

	// Create some test signups
	await prisma.signup.deleteMany({
		where: { eventId: event.id },
	});

	// Create signups individually since createMany doesn't support optional fields like performingAt
	await prisma.signup.create({
		data: {
			singerName: 'John Doe',
			songTitle: 'Bohemian Rhapsody',
			artist: 'Queen',
			performanceType: 'SOLO',
			position: 1,
			status: 'QUEUED',
			eventId: event.id,
		},
	});

	await prisma.signup.create({
		data: {
			singerName: 'Jane Smith',
			songTitle: "Don't Stop Believin'",
			artist: 'Journey',
			performanceType: 'SOLO',
			position: 2,
			status: 'QUEUED',
			eventId: event.id,
		},
	});

	await prisma.signup.create({
		data: {
			singerName: 'Bob & Alice',
			songTitle: 'Islands in the Stream',
			artist: 'Kenny Rogers & Dolly Parton',
			performanceType: 'DUET',
			position: 3,
			status: 'PERFORMING',
			eventId: event.id,
		},
	});

	await prisma.signup.create({
		data: {
			singerName: 'Charlie Brown',
			songTitle: 'Sweet Caroline',
			artist: 'Neil Diamond',
			performanceType: 'SOLO',
			position: 0, // This one was completed
			status: 'COMPLETE',
			eventId: event.id,
		},
	});

	console.log('Seed data created successfully!');
	console.log(`Event: ${event.name} (${event.slug})`);
	console.log(`Host: ${profile.email}`);
	console.log('\n👥 Users created:');
	console.log(`  - ${profile.email} (SUPER_ADMIN)`);
	console.log(`  - ${adminProfile.email} (ADMIN)`);
	console.log(`  - ${hostProfile.email} (HOST)`);
	console.log(`  - ${viewerProfile.email} (VIEWER)`);
	console.log('\n🎤 Signups created: 4 test signups with various statuses');
	console.log(
		'🔒 RBAC system initialized with role assignments and sample events'
	);
	console.log('\n🚀 Ready to test the application!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
