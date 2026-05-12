import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createSupabaseServerClient } from "$lib/server/supabase/server";
import {
  isDevAuthEnabled,
  DEV_COOKIE_NAME,
} from "$lib/server/auth/dev-session";

async function handleLogout(
  cookies: Parameters<RequestHandler>[0]["cookies"],
): Promise<never> {
  // Clear Supabase session (no-op when there is no real session — that's fine)
  const supabase = createSupabaseServerClient(cookies);
  await supabase.auth.signOut();

  // Clear dev auth cookie when the dev adapter is active
  if (isDevAuthEnabled()) {
    cookies.delete(DEV_COOKIE_NAME, { path: "/" });
  }

  redirect(302, "/accounts/login");
}

// Accept both GET (sidebar <a> links) and POST (form submissions)
export const GET: RequestHandler = ({ cookies }) => handleLogout(cookies);
export const POST: RequestHandler = ({ cookies }) => handleLogout(cookies);
