import { GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_SECRET, AUTH_SECRET, GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID } from '$env/static/private';
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import type { Handle } from '@sveltejs/kit';

// Validate required environment variables
if (!AUTH_SECRET) {
    console.error('AUTH_SECRET is not set. Please set it in your .env file.');
    throw new Error('AUTH_SECRET is required');
}

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth credentials are not set. Google authentication will not work.');
}

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn('GitHub OAuth credentials are not set. GitHub authentication will not work.');
}

const auth = SvelteKitAuth({
    providers: [
        ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET ? [
            Google({
                clientId: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET
            })
        ] : []),
        ...(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET ? [
            GitHub({
                clientId: GITHUB_CLIENT_ID,
                clientSecret: GITHUB_CLIENT_SECRET
            })
        ] : [])
    ],
    secret: AUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        encryption: false
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }
            if (profile) {
                token.provider = account?.provider;
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                accessToken: token.accessToken,
                provider: token.provider
            };
        }
    },
    pages: {
        signIn: '/login'
    },
    debug: process.env.NODE_ENV === 'development'
});

export const { handle } = auth;
export { auth }; 