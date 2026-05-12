import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { companyRegisterSchema } from '$lib/server/validators/auth.schema';
import { supabaseAdmin } from '$lib/server/supabase/admin';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const acceptedTos = formData.get('acceptedTos');

    if (!acceptedTos) {
      return fail(400, {
        error: 'Please accept the Terms & Conditions.',
        email
      });
    }

    const result = companyRegisterSchema.safeParse({
      email,
      password,
      confirmPassword
    });

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

    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'company',
        full_name: email.split('@')[0]
      }
    });

    if (signUpError) {
      return fail(400, {
        error: signUpError.message,
        email
      });
    }

    const { error: loginError } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      return fail(400, {
        error: 'Account created but auto-login failed. Please log in manually.',
        email
      });
    }

    throw redirect(302, '/company/dashboard');
  }
};
