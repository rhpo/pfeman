/**
 * Drizzle DB Client — Development SQLite (via libsql)
 *
 * Uses @libsql/client which is a pure-JS/WASM SQLite driver.
 * No native compilation needed — works on Windows, macOS, Linux out of the box.
 *
 * DATABASE_URL examples:
 *   file:./dev.db      → local SQLite file (default)
 *   file::memory:      → in-memory SQLite (tests)
 *   libsql://...       → Turso (production SQLite-over-HTTP)
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

const url = process.env.DATABASE_URL ?? 'file:./dev.db';

const client = createClient({ url });

export const db = drizzle(client, { schema });

/** Inferred type of the drizzle instance — useful for passing db around */
export type DrizzleDb = typeof db;
