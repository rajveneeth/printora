import { prisma } from '@/lib/prisma';
import { createDatabaseSearchRepository } from './database-search.repository';

/**
 * The production adapter is isolated from the repository's pure query builders.
 * This keeps browser bundles and unit tests from loading Prisma as a side effect
 * when they provide their own repository implementation.
 */
export const databaseSearchRepository = createDatabaseSearchRepository(prisma);
