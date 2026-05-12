import { redirect } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID } from '$env/static/private';

export async function GET() {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        redirect_uri: 'http://localhost:5173/auth/callback',
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent'
    });

    throw redirect(
        302,
        `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    );
}
