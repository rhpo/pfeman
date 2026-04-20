/**
 * Auth types – user roles and session models.
 *
 * Roles hierarchy (highest → lowest):
 *   superadmin > admin > teacher > student > company
 *
 * - superadmin / admin / teacher / student authenticate via Google OAuth
 *   (university accounts).
 * - company authenticates via email + password.
 */

export const USER_ROLES = ['superadmin', 'admin', 'teacher', 'student', 'company'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Minimal Google profile returned by the userinfo endpoint. */
export interface GoogleProfile {
    id: string;
    email: string;
    name: string;
    picture: string;
    verified_email: boolean;
    given_name?: string;
    family_name?: string;
}

/** The canonical user object stored in sessions. */
export interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    role: UserRole;
    provider: 'google' | 'credentials';
    createdAt: number; // epoch ms
}

/** What gets serialised into the session cookie is just the session ID. */
export interface SessionData {
    user: User;
    expiresAt: number; // epoch ms
}
