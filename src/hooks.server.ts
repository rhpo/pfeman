import type { Handle } from "@sveltejs/kit";
import { createSupabaseServerClient } from "$lib/server/supabase/server";
import { createRepositories } from "$lib/server/repositories/factory";
import type { SessionUser, UserRole } from "$lib/types/domain";
import { readDevSession } from "$lib/server/auth/dev-session";

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createSupabaseServerClient(event.cookies);
  event.locals.supabase = supabase;
  event.locals.db = createRepositories(supabase);

  // == Dev Auth Bypass =========
  // Only runs when DATABASE_ADAPTER !== "supabase" AND NODE_ENV !== "production".
  // Reads the HMAC-signed __dev_auth cookie set by /dev/login.
  // If valid, we short-circuit — Supabase Auth is never called.
  const devUser = readDevSession(event.cookies);
  if (devUser) {
    event.locals.user = devUser;
    return resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === "content-range" || name === "x-supabase-api-version";
      },
    });
  }

  // == Production Auth (Supabase) ============
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await event.locals.db.users.findProfileById(user.id);

    if (profile) {
      event.locals.user = {
        id: profile.id,
        email: user.email ?? "",
        role: profile.role as UserRole,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        provider: user.app_metadata.provider,
        created_at: user.created_at,
      } satisfies SessionUser;
    } else {
      // Fallback: race condition between trigger and first request
      event.locals.user = {
        id: user.id,
        email: user.email ?? "",
        role: (user.user_metadata?.role as UserRole) ?? "student",
        full_name:
          user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
        avatar_url:
          user.user_metadata?.avatar_url ?? user.user_metadata?.picture,
        provider: user.app_metadata.provider,
        created_at: user.created_at,
      } satisfies SessionUser;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
