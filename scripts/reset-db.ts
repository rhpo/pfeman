/**
 * reset-db.ts
 *
 * Wipes dev.db and recreates all tables from the current schema.
 * Run with: pnpm tsx scripts/reset-db.ts
 *
 * Equivalent to: delete dev.db + drizzle-kit push (without interactive prompts).
 */

import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const DB_PATH = resolve(process.cwd(), 'dev.db');

// 1. Delete existing DB file
if (existsSync(DB_PATH)) {
  rmSync(DB_PATH, { force: true });
  console.log('[reset-db] Removed dev.db');
} else {
  console.log('[reset-db] No dev.db found, creating fresh.');
}

// 2. Re-create all tables by importing the client (which opens the file)
//    then using drizzle to create tables via push logic.
//    We use drizzle-kit's pushSchema API directly.
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/lib/server/db/schema.js';

const client = createClient({ url: `file:${DB_PATH}` });
const db = drizzle(client, { schema });

// Run raw CREATE TABLE statements derived from schema
// (drizzle-kit push equivalent without interactive prompts)
const { pushSchema } = await import('drizzle-kit/api');

const result = await pushSchema(schema, db as any, []);

if (result.hasDataLoss) {
  console.warn('[reset-db] WARNING: data loss detected (expected on fresh DB).');
}

await result.apply();

console.log('[reset-db] Schema applied successfully. Fresh dev.db is ready.');
client.close();
