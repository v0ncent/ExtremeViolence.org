import type { RequestHandler } from './$types';
import { AdminService } from '$lib/services/adminService';
import { AUTH_SECRET } from '$env/static/private';
import { compactDecrypt } from 'jose';

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

        console.log('Found session token, length:', sessionToken.length);

        try {
            // Auth.js uses JWE (JSON Web Encryption) tokens, not JWT
            // Decrypt the JWE token using the AUTH_SECRET
            const secret = new TextEncoder().encode(AUTH_SECRET);
            const { plaintext } = await compactDecrypt(sessionToken, secret);
            const sessionData = JSON.parse(new TextDecoder().decode(plaintext));

            console.log('Decrypted session data:', sessionData);

            if (sessionData && sessionData.user) {
                const user = sessionData.user;

                if (user && user.email) {
                    // Check admin status for the actual user
                    const isAdmin = await AdminService.checkAdminStatusServer(user.email);

                    // Determine provider from the session data
                    const provider = sessionData.provider ||
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
            }
        } catch (decryptError) {
            console.log('JWE decryption failed:', decryptError);

            // Provide more detailed error information
            const errorDetails = {
                error: 'Failed to decrypt session token',
                message: decryptError instanceof Error ? decryptError.message : String(decryptError),
                tokenLength: sessionToken.length,
                tokenPreview: sessionToken.substring(0, 50) + '...',
                hasAuthSecret: !!AUTH_SECRET,
                authSecretLength: AUTH_SECRET ? AUTH_SECRET.length : 0
            };

            console.error('Session decryption error details:', errorDetails);

            // Fallback: try to decode as base64 to see if it's a different format
            try {
                const decoded = Buffer.from(sessionToken, 'base64').toString();
                console.log('Base64 decoded token structure:', decoded.substring(0, 200) + '...');
            } catch (decodeError) {
                console.error('Failed to decode session token:', decodeError);
            }
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