/**
 * Programmatic Migration Runner
 *
 * Used for automated environments (CI, Docker startup, staging).
 * Applies all pending migrations from the ./drizzle folder.
 *
 * For everyday development, prefer `pnpm db:push` which syncs
 * the schema directly without generating migration files.
 *
 * Usage (standalone script):
 *   node --import tsx/esm src/lib/server/db/migrate.ts
 *
 * Usage (inside server hooks for auto-migrate on startup):
 *   import { runMigrations } from '$lib/server/db/migrate';
 *   await runMigrations();
 */

import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './client.js';

export async function runMigrations(): Promise<void> {
  console.log('[db] Running migrations…');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('[db] Migrations complete.');
}

// Allow running directly: `pnpm tsx src/lib/server/db/migrate.ts`
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations().catch((err) => {
    console.error('[db] Migration failed:', err);
    process.exit(1);
  });
}
