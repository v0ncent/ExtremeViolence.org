import type { RequestHandler } from './$types';
import { AdminService } from '$lib/services/adminService';
import { AUTH_SECRET } from '$env/static/private';
import { jwtVerify } from 'jose';

export const GET: RequestHandler = async (event) => {
    try {
        // Check if AUTH_SECRET is available
        if (!AUTH_SECRET) {
            console.error('AUTH_SECRET is not set');
            return new Response(JSON.stringify({
                error: 'AUTH_SECRET is not configured',
                user: null
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get cookies from the request
        const cookies = event.request.headers.get('cookie');

        if (!cookies) {
            console.log('No cookies found');
            return new Response(JSON.stringify({ user: null }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse cookies to find Auth.js session token
        const cookiePairs = cookies.split(';').map(c => c.trim().split('='));
        const sessionToken = cookiePairs.find(([name]) => name === 'authjs.session-token')?.[1];

        if (!sessionToken) {
            console.log('No session token found');
            return new Response(JSON.stringify({ user: null }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Session token value:', sessionToken);

        try {
            // Verify the JWT using jose
            const secret = new TextEncoder().encode(AUTH_SECRET);
            const { payload } = await jwtVerify(sessionToken, secret);

            // Auth.js puts user info in payload.user or payload.sub
            const user = (payload.user && typeof payload.user === 'object') ? payload.user as Record<string, any> : null;

            if (user && typeof user.email === 'string') {
                // Check admin status for the actual user
                const isAdmin = await AdminService.checkAdminStatusServer(user.email);

                // Determine provider from the session data
                const provider = payload.provider ||
                    (user.email?.includes('@gmail.com') ? 'google' :
                        user.email?.includes('@github.com') ? 'github' : 'unknown');

                const responseData = {
                    user: {
                        id: user.id || user.email || '',
                        name: user.name || '',
                        email: user.email || '',
                        image: user.image || undefined
                    },
                    provider,
                    isAdmin
                };

                console.log(`Session loaded for ${user.email} (${isAdmin ? 'ADMIN' : 'USER'})`);

                return new Response(JSON.stringify(responseData), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (verifyError) {
            console.error('JWT verification failed:', verifyError);
        }

        // If all else fails, return null (user not authenticated)
        console.log('No valid session found');
        return new Response(JSON.stringify({ user: null }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Session error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get session' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 