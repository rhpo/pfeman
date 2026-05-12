import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { authenticateCompany, createSession } from '$lib/server/auth';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return fail(400, {
                error: 'Please fill in all fields.',
                email
            });
        }

        const result = authenticateCompany(email, password);

        if (typeof result === 'string') {
            return fail(401, {
                error: result,
                email
            });
        }

        // result is now a User
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
