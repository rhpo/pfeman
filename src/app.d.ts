/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Locals {
      supabase: import("@supabase/supabase-js").SupabaseClient<
        import("$lib/types/database").Database
      >;
      db: import("$lib/server/repositories/port").IRepositories;
      user: import("$lib/types/domain").SessionUser | null;
    }
    interface PageData {
      user: import("$lib/types/domain").SessionUser | null;
    }
  }
}

export { };
