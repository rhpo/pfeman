/**
 * Company credential authentication.
 *
 * In-memory store for company accounts (email + password).
 * In production, replace with a real database and use bcrypt/argon2.
 */

import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import type { User } from './types.js';

interface CompanyRecord {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: number;
}

const companies = new Map<string, CompanyRecord>();

/**
 * Hash a password. In production use bcrypt or argon2 – this is a placeholder.
 */
function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

/** Register a new company account. Returns the User on success, or an error string. */
export function registerCompany(
    email: string,
    password: string,
    name?: string
): User | string {
    const normalised = email.toLowerCase().trim();

    if (companies.has(normalised)) {
        return 'An account with this email already exists.';
    }

    if (password.length < 6) {
        return 'Password must be at least 6 characters.';
    }

    const id = randomUUID();
    const record: CompanyRecord = {
        id,
        email: normalised,
        passwordHash: hashPassword(password),
        name: name || normalised.split('@')[0],
        createdAt: Date.now()
    };

    companies.set(normalised, record);

    return {
        id,
        email: normalised,
        name: record.name,
        picture: '',
        role: 'company',
        provider: 'credentials',
        createdAt: record.createdAt
    };
}

/** Authenticate a company by email + password. Returns the User or an error string. */
export function authenticateCompany(
    email: string,
    password: string
): User | string {
    const normalised = email.toLowerCase().trim();
    const record = companies.get(normalised);

    if (!record) {
        return 'No account found with this email.';
    }

    if (record.passwordHash !== hashPassword(password)) {
        return 'Invalid password.';
    }

    return {
        id: record.id,
        email: record.email,
        name: record.name,
        picture: '',
        role: 'company',
        provider: 'credentials',
        createdAt: record.createdAt
    };
}
