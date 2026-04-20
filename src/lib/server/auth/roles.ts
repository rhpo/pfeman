/**
 * Role resolution for Google-authenticated university users.
 *
 * This module determines what role a Google user gets based on their email.
 * In production you'd query a database; for now we use simple config maps.
 *
 * Rules:
 *  1. If the email is in SUPERADMIN_EMAILS → superadmin
 *  2. If the email is in ADMIN_EMAILS → admin
 *  3. If the email is in TEACHER_EMAILS → teacher
 *  4. Otherwise → student (default for any university Google account)
 */

import type { UserRole } from './types.js';

// ──────────────────────────────────────────────
// Configure these lists to assign specific roles.
// In production, replace with database lookups.
// ──────────────────────────────────────────────

/** Emails that get the superadmin role. */
const SUPERADMIN_EMAILS: Set<string> = new Set([
    // e.g. 'admin@esst.dz'
]);

/** Emails that get the admin role. */
const ADMIN_EMAILS: Set<string> = new Set([
    // e.g. 'head-of-dept@esst.dz'
]);

/** Emails that get the teacher role. */
const TEACHER_EMAILS: Set<string> = new Set([
    // e.g. 'prof.smith@esst.dz'
]);

/**
 * Resolve the role for a Google-authenticated user.
 * Falls back to 'student' for any recognised university email.
 */
export function resolveGoogleUserRole(email: string): UserRole {
    const normalised = email.toLowerCase().trim();

    if (SUPERADMIN_EMAILS.has(normalised)) return 'superadmin';
    if (ADMIN_EMAILS.has(normalised)) return 'admin';
    if (TEACHER_EMAILS.has(normalised)) return 'teacher';

    return 'student';
}
