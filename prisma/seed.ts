import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Create a test profile with an email you can access
	const profile = await prisma.profile.upsert({
		where: { email: '1992savg@gmail.com' },
		update: {},
		create: {
			email: '1992savg@gmail.com',
			givenName: 'Test',
			familyName: 'Host',
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
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
