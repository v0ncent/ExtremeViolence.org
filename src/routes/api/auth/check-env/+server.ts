import type { RequestHandler } from './$types';
import { AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export const GET: RequestHandler = async () => {
    const envCheck = {
        AUTH_SECRET: {
            exists: !!AUTH_SECRET,
            length: AUTH_SECRET ? AUTH_SECRET.length : 0,
            preview: AUTH_SECRET ? AUTH_SECRET.substring(0, 10) + '...' : 'NOT_SET'
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
        },
        GITHUB_CLIENT_ID: {
            exists: !!GITHUB_CLIENT_ID,
            length: GITHUB_CLIENT_ID ? GITHUB_CLIENT_ID.length : 0,
            preview: GITHUB_CLIENT_ID ? GITHUB_CLIENT_ID.substring(0, 20) + '...' : 'NOT_SET'
        },
        GITHUB_CLIENT_SECRET: {
            exists: !!GITHUB_CLIENT_SECRET,
            length: GITHUB_CLIENT_SECRET ? GITHUB_CLIENT_SECRET.length : 0,
            preview: GITHUB_CLIENT_SECRET ? '***SET***' : 'NOT_SET'
        }
    };

    const allRequired = envCheck.AUTH_SECRET.exists &&
        (envCheck.GOOGLE_CLIENT_ID.exists || envCheck.GITHUB_CLIENT_ID.exists);

    return new Response(JSON.stringify({
        allRequired,
        envCheck,
        message: allRequired ? 'All required environment variables are set' : 'Missing required environment variables'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}; 