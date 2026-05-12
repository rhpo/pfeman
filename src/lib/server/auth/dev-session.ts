/**
 * Dev Auth Session — DEVELOPMENT ONLY
 *
 * Provides cookie-based authentication that completely bypasses Supabase Auth.
 * Useful when you need multiple accounts with @esst-sup.com addresses but don't
 * want to create real Google accounts.
 *
 * Security model:
 *  - The cookie value is HMAC-SHA256 signed with DEV_AUTH_SECRET
 *  - timingSafeEqual prevents timing attacks
 *  - The guard `isDevAuthEnabled()` ensures this is NEVER active in production
 *  - In production (NODE_ENV=production or DATABASE_ADAPTER=supabase) the cookie
 *    is ignored entirely — zero surface area
 *
 * Flow:
 *   /dev/login (persona picker) → sets __dev_auth cookie → app works normally
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import type { SessionUser, UserRole } from '$lib/types/domain.js';

// === Constants ==

export const DEV_COOKIE_NAME = '__dev_auth';

/** Fallback secret — override with DEV_AUTH_SECRET in .env for extra safety. */
const DEV_SECRET = process.env.DEV_AUTH_SECRET ?? 'dev-only-secret-not-for-production';

// === Guard ================

/**
 * Returns true when the dev auth bypass should be active.
 *
 * Active only when BOTH conditions hold:
 *   1. NODE_ENV is not "production"
 *   2. DATABASE_ADAPTER is not "supabase"
 */
export function isDevAuthEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.DATABASE_ADAPTER !== 'supabase'
  );
}

// === Payload ===

export interface DevPayload {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'company';
  full_name: string;
  avatar_url: string | null;
}

// === Signing ===

/** Encode and HMAC-sign a dev session payload. Returns the cookie string. */
export function signDevSession(payload: DevPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', DEV_SECRET).update(data).digest('hex');
  return `${data}.${sig}`;
}

/** Verify a signed cookie string. Returns null if tampered or malformed. */
export function verifyDevSession(cookie: string): DevPayload | null {
  try {
    const lastDot = cookie.lastIndexOf('.');
    if (lastDot === -1) return null;

    const data = cookie.slice(0, lastDot);
    const sig  = cookie.slice(lastDot + 1);

    const expected    = createHmac('sha256', DEV_SECRET).update(data).digest('hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    const sigBuf      = Buffer.from(sig,      'hex');

    // Different lengths → definitely tampered; also guards timingSafeEqual's requirement
    if (sigBuf.length === 0 || sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as DevPayload;
  } catch {
    return null;
  }
}

// === Cookie helpers ============

export const DEV_COOKIE_OPTIONS = {
  path:     '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  secure:   false,           // no HTTPS needed locally
  maxAge:   60 * 60 * 24 * 7, // 7 days
} as const;

/**
 * Read + verify the dev session cookie and map it to a SvelteKit SessionUser.
 * Returns null when the cookie is absent, expired, or tampered.
 */
export function readDevSession(cookies: Cookies): SessionUser | null {
  if (!isDevAuthEnabled()) return null;

  const raw = cookies.get(DEV_COOKIE_NAME);
  if (!raw) return null;

  const payload = verifyDevSession(raw);
  if (!payload) return null;

  return {
    id:         payload.id,
    email:      payload.email,
    role:       payload.role as UserRole,
    full_name:  payload.full_name,
    avatar_url: payload.avatar_url,
    provider:   'dev',
    created_at: new Date().toISOString(),
  } satisfies SessionUser;
}
