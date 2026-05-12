import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { companyLoginSchema } from '$lib/server/validators/auth.schema';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = companyLoginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.issues.reduce((acc, issue) => {
        const key = String(issue.path[0]);
        acc[key] = issue.message;
        return acc;
      }, {} as Record<string, string>);

      return fail(400, {
        error: Object.values(fieldErrors)[0],
        email
      });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return fail(401, {
        error: error.message,
        email
      });
    }

    throw redirect(302, '/company/dashboard');
  }
};
