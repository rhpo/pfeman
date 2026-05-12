import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { requireRole } from '$lib/server/guards/require-role';

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    const user = requireRole(locals.user, 'teacher');
    return { user };
  } catch (err) {
    throw redirect(302, '/accounts/login');
  }
};
