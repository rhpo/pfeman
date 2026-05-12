import { error } from '@sveltejs/kit';
import type { SessionUser } from '$lib/types/domain';

export function requireAuth(user: SessionUser | null): SessionUser {
  if (!user) {
    throw error(401, { message: 'Authentication required' });
  }
  return user;
}
