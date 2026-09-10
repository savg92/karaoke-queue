// This file exports a singleton instance of the Prisma Client.
// By using a singleton, we ensure that only one instance of Prisma Client is running at any given time,
// which prevents connection pool exhaustion and improves performance.

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';

declare global {
	var prisma: PrismaClient | undefined;
	var pgPool: Pool | undefined;
}

const pool =
	global.pgPool ||
	new Pool({
		connectionString: process.env.DATABASE_URL,
	});

if (process.env.NODE_ENV !== 'production') {
	global.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma;
}

export * from '../../prisma/generated/client';
