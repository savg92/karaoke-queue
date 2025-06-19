// This file exports a singleton instance of the Prisma Client.
// By using a singleton, we ensure that only one instance of Prisma Client is running at any given time,
// which prevents connection pool exhaustion and improves performance.

import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance.
// This is necessary because in a serverless environment, the module might be re-evaluated,
// and we want to persist the client across multiple invocations.
declare global {
	var prisma: PrismaClient | undefined;
}

// Initialize the Prisma Client.
// If a global instance already exists, use it; otherwise, create a new one.
// In a development environment, the global object is used to cache the client,
// preventing the creation of new clients on every hot reload.
export const prisma = global.prisma || new PrismaClient();

// If we are not in a production environment, assign the Prisma Client to the global object.
// This ensures that the same client is reused during development, avoiding performance issues.
if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma;
}
