import type { PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";
import { isDevAuthEnabled } from "$lib/server/auth/dev-session";

export const load: PageServerLoad = async ({ url, locals }) => {
  if (locals.user) {
    throw redirect(302, "/dashboard");
  }

  const error = url.searchParams.get("error");
  const data = (() => {
    try {
      return JSON.parse(url.searchParams.get("data") || "{}");
    } catch {
      return null;
    }
  })();

  let errorMessage: string | null = null;

  if (error) {
    switch (error) {
      case "auth_failed":
        errorMessage = "Authentication failed. Please try again.";
        break;
      case "no_auth_code":
        errorMessage = "Auth code missing. Ensure you use Google to sign in.";
        break;
      case "session_missing":
        errorMessage = "Authenticated but session not found. Check cookies.";
        break;
      case "invalid_domain":
        errorMessage =
          "Access Denied. You must use your @esst-sup.com university account.";
        break;
      case "access_denied":
        errorMessage = `Access Denied${data?.email ? ` (${data.email})` : ""}. Your account is not registered in our records. Please contact the administration.`;
        break;
      default:
        errorMessage = error;
    }
  }

  return {
    error: errorMessage,
    showDevButton: isDevAuthEnabled(),
  };
};
