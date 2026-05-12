/**
 * In-memory session store.
 *
 * In production you'd back this with Redis / a database.
 * For now it keeps sessions in a Map keyed by a crypto-random token.
 */

import { randomUUID } from 'node:crypto';
import type { SessionData, User } from './types.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const sessions = new Map<string, SessionData>();

/** Create a new session for the given user. Returns the session token. */
export function createSession(user: User): string {
    const token = randomUUID();
    sessions.set(token, {
        user,
        expiresAt: Date.now() + SESSION_TTL_MS
    });
    return token;
}

/** Look up a session by its token. Returns null if expired or missing. */
export function getSession(token: string): SessionData | null {
    const session = sessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return null;
    }

    return session;
}

/** Destroy a session (logout). */
export function destroySession(token: string): void {
    sessions.delete(token);
}
