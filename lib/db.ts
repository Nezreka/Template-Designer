import { PrismaClient } from '@prisma/client';

// Create a global instance of PrismaClient to be reused across requests
// This prevents connection issues in development with Next.js fast refresh

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new client if it doesn't exist already
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
export default prisma;