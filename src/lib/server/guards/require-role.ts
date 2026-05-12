import { error } from '@sveltejs/kit';
import type { SessionUser, UserRole } from '$lib/types/domain';

/**
 * Checks if the user has one of the allowed roles.
 * Admins are automatically allowed for any role requirement.
 */
export function requireRole(
  user: SessionUser | null,
  ...allowed: UserRole[]
): SessionUser {
  if (!user) {
    throw error(401, { message: 'Authentication required' });
  }

  // Admins have bypass permissions for all role-restricted routes
  if (user.role === 'admin') {
    return user;
  }

  if (!allowed.includes(user.role)) {
    throw error(403, { message: 'Insufficient permissions' });
  }

  return user;
}
