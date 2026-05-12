import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { UserRole } from '$lib/types/domain';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== ('admin' as UserRole)) {
    throw redirect(302, '/accounts/login');
  }
  return { user: locals.user };
};
