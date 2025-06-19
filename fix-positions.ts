import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixQueuePositions() {
	console.log('Fixing queue positions...');

	// Get all events
	const events = await prisma.event.findMany({
		include: {
			signups: {
				where: {
					status: {
						in: ['QUEUED', 'PERFORMING'],
					},
				},
				orderBy: {
					createdAt: 'asc',
				},
			},
		},
	});

	for (const event of events) {
		console.log(`\nFixing positions for event: ${event.name}`);

		// Update positions for active signups
		const updatePromises = event.signups.map((signup, index) => {
			console.log(
				`  - ${signup.singerName}: position ${signup.position} -> ${index + 1}`
			);
			return prisma.signup.update({
				where: { id: signup.id },
				data: { position: index + 1 },
			});
		});

		await Promise.all(updatePromises);
	}

	console.log('\nQueue positions fixed!');
}

fixQueuePositions()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
