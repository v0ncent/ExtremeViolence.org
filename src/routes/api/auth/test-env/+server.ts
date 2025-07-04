import type { RequestHandler } from './$types';
import { AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

export const GET: RequestHandler = async () => {
    const envInfo = {
        AUTH_SECRET: {
            exists: !!AUTH_SECRET,
            length: AUTH_SECRET ? AUTH_SECRET.length : 0,
            bits: AUTH_SECRET ? AUTH_SECRET.length * 6 : 0, // Base64 encoding: 6 bits per character
            preview: AUTH_SECRET ? AUTH_SECRET.substring(0, 10) + '...' : 'NOT_SET',
            isValid: AUTH_SECRET ? AUTH_SECRET.length === 44 : false // Base64 encoded 32 bytes = 44 characters
        },
        GOOGLE_CLIENT_ID: {
            exists: !!GOOGLE_CLIENT_ID,
            length: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.length : 0,
            preview: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT_SET'
        },
        GOOGLE_CLIENT_SECRET: {
            exists: !!GOOGLE_CLIENT_SECRET,
            length: GOOGLE_CLIENT_SECRET ? GOOGLE_CLIENT_SECRET.length : 0,
            preview: GOOGLE_CLIENT_SECRET ? '***SET***' : 'NOT_SET'
        }
    };

    return new Response(JSON.stringify({
        envInfo,
        message: envInfo.AUTH_SECRET.isValid ? 'AUTH_SECRET is valid' : 'AUTH_SECRET is invalid - should be 44 characters',
        recommendation: envInfo.AUTH_SECRET.isValid ? 'Environment looks good!' : 'Please update your AUTH_SECRET to be exactly 44 characters'
    }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}; 