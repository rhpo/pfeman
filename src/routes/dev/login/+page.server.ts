/**
 * Dev Login — server-side actions
 *
 * Only accessible when isDevAuthEnabled() → true.
 * Upserts the profile (and role-specific domain row) in SQLite,
 * then sets a signed dev session cookie.
 */

import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

import {
  isDevAuthEnabled,
  signDevSession,
  readDevSession,
  DEV_COOKIE_NAME,
  DEV_COOKIE_OPTIONS,
} from '$lib/server/auth/dev-session';

// Import the Drizzle db + tables directly — dev login is inherently Drizzle-only
import { db } from '$lib/server/db/client';
import { profiles, teachers, teacherSpecialities, students, companies } from '$lib/server/db/schema';

// === Guard ================

function guardDev(): void {
  if (!isDevAuthEnabled()) error(404, 'Not Found');
}

// === Load =================

export const load: PageServerLoad = async ({ cookies }) => {
  guardDev();
  const current = readDevSession(cookies);
  return { current };
};

// === Actions ===

export const actions: Actions = {
  /**
   * Log in as a chosen persona.
   * Creates the SQLite profile row on first login (auto-provisions the account).
   * Also creates the role-specific domain row (teacher/student/company)
   * so all FK constraints are satisfied from the start.
   */
  login: async ({ request, cookies }) => {
    guardDev();

    const data      = await request.formData();
    const id        = String(data.get('id')        ?? '').trim();
    const email     = String(data.get('email')     ?? '').trim();
    const role      = String(data.get('role')      ?? '') as 'student' | 'teacher' | 'admin' | 'company';
    const full_name = String(data.get('full_name') ?? '').trim();

    if (!id || !email || !role || !full_name) {
      error(400, 'All fields are required');
    }

    // == Upsert profiles row ====
    const existing = await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.id, id),
    });

    if (!existing) {
      await db.insert(profiles).values({ id, role, full_name, avatar_url: null });
    } else {
      await db.update(profiles)
        .set({ role, full_name, updated_at: new Date().toISOString() })
        .where(eq(profiles.id, id));
    }

    // == Upsert domain/whitelist row ==========
    // Ensures FK constraints are satisfied for every operation the role can do.

    if (role === 'teacher') {
      const row = await db.query.teachers.findFirst({
        where: (t, { eq }) => eq(t.profile_id, id),
      });
      if (!row) {
        await db.insert(teachers).values({
          id:          id,
          profile_id:  id,
          email,
          grade:       'mcb' as const,
          department:  'Computer Science',
        });
      }

    } else if (role === 'student') {
      const row = await db.query.students.findFirst({
        where: (s, { eq }) => eq(s.profile_id, id),
      });
      if (!row) {
        // Derive a stable, unique student number from the persona id
        const num = `DEV-${id.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 8)}`;
        await db.insert(students).values({
          profile_id:     id,
          email,
          student_number: num,
          specialty:      'Software Engineering',
          level:          'master',
          promotion_year: new Date().getFullYear(),
        });
      }

    } else if (role === 'company') {
      const row = await db.query.companies.findFirst({
        where: (c, { eq }) => eq(c.profile_id, id),
      });
      if (!row) {
        await db.insert(companies).values({
          profile_id:   id,
          company_name: full_name,
          sector:       'Technology',
          is_verified:  true,
        });
      }
    }

    // == Sign + set cookie ======
    const token = signDevSession({ id, email, role, full_name, avatar_url: null });
    cookies.set(DEV_COOKIE_NAME, token, DEV_COOKIE_OPTIONS);

    redirect(302, '/dashboard');
  },

  /** Clear the dev session cookie and return to the login page. */
  logout: async ({ cookies }) => {
    guardDev();
    cookies.delete(DEV_COOKIE_NAME, { path: '/' });
    redirect(302, '/dev/login');
  },
};
