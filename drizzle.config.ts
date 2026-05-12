import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit Configuration
 *
 * In development  → uses local SQLite file (DATABASE_URL=file:./dev.db)
 * In production   → set DATABASE_URL to your Supabase / PostgreSQL connection string
 *                   and switch dialect to 'postgresql'
 *
 * Key commands:
 *   pnpm db:push      — sync schema directly to the dev SQLite file (no migration files)
 *   pnpm db:generate  — generate a SQL migration from schema diff
 *   pnpm db:migrate   — apply pending migrations
 *   pnpm db:studio    — open Drizzle Studio to inspect data
 */
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
});
