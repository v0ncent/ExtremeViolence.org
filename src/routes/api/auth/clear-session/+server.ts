import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
    // Create a response that clears all Auth.js related cookies
    const response = new Response(JSON.stringify({
        success: true,
        message: 'Session cookies cleared'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

    // Clear all possible Auth.js session cookies
    const cookiesToClear = [
        'authjs.session-token',
        'authjs.csrf-token',
        'authjs.callback-url',
        'authjs.pkce.code_verifier',
        '__Secure-authjs.session-token',
        '__Host-authjs.csrf-token'
    ];

    cookiesToClear.forEach(cookieName => {
        response.headers.append('Set-Cookie', `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`);
    });

    return response;
}; 