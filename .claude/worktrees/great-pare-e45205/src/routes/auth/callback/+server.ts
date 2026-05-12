import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { createSession, resolveGoogleUserRole } from '$lib/server/auth';
import type { GoogleProfile, User } from '$lib/server/auth/types';

export const GET: RequestHandler = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');

    if (!code) {
        return new Response('No code provided', { status: 400 });
    }

    // 1. Exchange authorisation code → access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
            redirect_uri: 'http://localhost:5173/auth/callback',
            grant_type: 'authorization_code'
        })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        console.error('Token exchange failed:', tokenData);
        return new Response('Authentication failed', { status: 401 });
    }

    // 2. Fetch Google profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`
        }
    });

    const profile: GoogleProfile = await userRes.json();

    if (!profile.email) {
        return new Response('Could not retrieve email from Google', { status: 401 });
    }

    // 3. Resolve role from email
    const role = resolveGoogleUserRole(profile.email);

    // 4. Build canonical user
    const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        role,
        provider: 'google',
        createdAt: Date.now()
    };

    // 5. Create server session & set secure cookie
    const sessionToken = createSession(user);

    cookies.set('session_token', sessionToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // set true in production
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // 6. Redirect to dashboard
    throw redirect(302, '/dashboard');
};
