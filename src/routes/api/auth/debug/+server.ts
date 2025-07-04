import type { RequestHandler } from './$types';
import { AUTH_SECRET } from '$env/static/private';
import { compactDecrypt } from 'jose';

export const GET: RequestHandler = async (event) => {
    try {
        // Check if AUTH_SECRET is available
        const hasAuthSecret = !!AUTH_SECRET;
        const authSecretLength = AUTH_SECRET ? AUTH_SECRET.length : 0;

        // Get cookies from the request
        const cookies = event.request.headers.get('cookie');

        if (!cookies) {
            return new Response(JSON.stringify({
                error: 'No cookies found',
                hasAuthSecret,
                authSecretLength
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse cookies to find Auth.js session token
        const cookiePairs = cookies.split(';').map(c => c.trim().split('='));
        const sessionToken = cookiePairs.find(([name]) => name === 'authjs.session-token')?.[1];

        if (!sessionToken) {
            return new Response(JSON.stringify({
                error: 'No session token found',
                hasAuthSecret,
                authSecretLength,
                availableCookies: cookiePairs.map(([name]) => name)
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            // Decrypt the JWE token using the AUTH_SECRET
            const secret = new TextEncoder().encode(AUTH_SECRET);
            const { plaintext } = await compactDecrypt(sessionToken, secret);
            const decoded = JSON.parse(new TextDecoder().decode(plaintext));

            return new Response(JSON.stringify({
                success: true,
                sessionData: decoded,
                tokenLength: sessionToken.length,
                hasAuthSecret,
                authSecretLength
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (decryptError) {
            return new Response(JSON.stringify({
                error: 'Failed to decrypt token',
                details: decryptError instanceof Error ? decryptError.message : String(decryptError),
                tokenLength: sessionToken.length,
                hasAuthSecret,
                authSecretLength,
                tokenPreview: sessionToken.substring(0, 50) + '...'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Debug error',
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 