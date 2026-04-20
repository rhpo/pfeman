import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    // ── Read session token from cookie ──
    const token = event.cookies.get('session_token');

    if (token) {
        const session = getSession(token);
        event.locals.user = session?.user ?? null;
    } else {
        event.locals.user = null;
    }

    // ── Protect /dashboard routes ──
    if (!event.locals.user && event.url.pathname.startsWith('/dashboard')) {
        return new Response(null, {
            status: 302,
            headers: { location: '/accounts/login' }
        });
    }

    return resolve(event);
};
