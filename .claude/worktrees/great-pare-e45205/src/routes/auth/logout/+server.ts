import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { destroySession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
    const token = cookies.get('session_token');

    if (token) {
        destroySession(token);
    }

    cookies.delete('session_token', { path: '/' });

    throw redirect(302, '/accounts/login');
};
