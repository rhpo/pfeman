import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/server/supabase/server';
import { supabaseAdmin } from '$lib/server/supabase/admin';
import { BRAND } from '$lib/constants/branding';
import type { Database } from '$lib/types/database';

const ROLE_DASHBOARDS: Record<string, string> = {
  student: '/student/dashboard',
  teacher: '/teacher/dashboard',
  admin: '/admin/dashboard',
  company: '/company/dashboard',
};

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const error_description = url.searchParams.get('error_description');

  if (error_description) {
    throw redirect(302, `/accounts/login?error=${encodeURIComponent(error_description)}`);
  }

  if (!code) {
    throw redirect(302, '/accounts/login?error=no_auth_code');
  }

  const supabase = createSupabaseServerClient(cookies);
  const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !session) {
    throw redirect(302, `/accounts/login?error=${encodeURIComponent(exchangeError?.message ?? 'Auth failed')}`);
  }

  const email = session.user.email ?? '';
  const userId = session.user.id;

  // 1. Strict Domain Enforcement
  if (!email.endsWith(`@${BRAND.university.domain}`)) {
    await supabase.auth.signOut();
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw redirect(302, '/accounts/login?error=invalid_domain');
  }

  // 2. Data Lookup (Whitelists)
  const [{ data: teacherRecord }, { data: studentRecord }, { data: existingProfile }] = await Promise.all([
    supabaseAdmin.from('teachers').select('id, profile_id').eq('email', email).single(),
    supabaseAdmin.from('students').select('id, profile_id').eq('email', email).single(),
    supabaseAdmin.from('profiles').select('role').eq('id', userId).single()
  ]);

  // 3. Role Determination Logic
  let finalRole: string | null = null;

  // Rule 1: Static Admin check (if they are already marked as admin in profiles)
  if (existingProfile?.role === "admin") {
    finalRole = "admin";
  }
  // Rule 2: If found in teacher whitelist, they are a teacher (or an admin who is also a teacher)
  else if (teacherRecord) {
    finalRole = "teacher";
  }
  // Rule 3: If found on student whitelist
  else if (studentRecord) {
    finalRole = "student";
  }

  // 4. Access Denied if not found in any whitelist and not an admin
  if (!finalRole) {
    await supabase.auth.signOut();
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw redirect(302, `/accounts/login?error=access_denied&data=${JSON.stringify({ email })}`);
  }

  // 5. Contextual Linkage (Link them to domain tables even if they are ADMIN)
  const updates = [];

  if (teacherRecord) {
    // If they are in the teacher table, link their profile regardless of whether they are ADMIN or TEACHER
    updates.push(supabaseAdmin.from('teachers').update({ profile_id: userId }).eq('email', email));
  }

  if (studentRecord && !teacherRecord) {
    updates.push(supabaseAdmin.from('students').update({ profile_id: userId }).eq('email', email));
  }

  // Ensure profiles table role is synced with our determined role
  updates.push(supabaseAdmin.from('profiles').upsert({
    id: userId,
    role: finalRole as "student" | "teacher" | "admin" | "company",
    full_name: session.user.user_metadata?.full_name || email.split('@')[0],
    avatar_url: session.user.user_metadata?.avatar_url ?? session.user.user_metadata?.picture
  }));

  if (updates.length > 0) {
    await Promise.all(updates);
  }

  const destination = ROLE_DASHBOARDS[finalRole] ?? '/';
  throw redirect(302, destination);
};
