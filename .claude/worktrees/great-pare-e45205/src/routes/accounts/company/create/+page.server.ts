import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { registerCompany, createSession } from '$lib/server/auth';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const acceptedTos = formData.get('acceptedTos');

        if (!email || !password || !confirmPassword) {
            return fail(400, {
                error: 'Please fill in all fields.',
                email
            });
        }

        if (password !== confirmPassword) {
            return fail(400, {
                error: 'Passwords do not match.',
                email
            });
        }

        if (!acceptedTos) {
            return fail(400, {
                error: 'Please accept the Terms & Conditions.',
                email
            });
        }

        const result = registerCompany(email, password);

        if (typeof result === 'string') {
            return fail(400, {
                error: result,
                email
            });
        }

        // result is now a User – auto-login after registration
        const token = createSession(result);

        cookies.set('session_token', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // set true in production
            maxAge: 60 * 60 * 24 * 7
        });

        throw redirect(302, '/dashboard');
    }
};
