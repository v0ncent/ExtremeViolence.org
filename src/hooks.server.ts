import { GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_SECRET, AUTH_SECRET, GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID } from '$env/static/private';
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';

const auth = SvelteKitAuth({
    providers: [
        Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET
        }),
        GitHub({
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET
        })
    ],
    secret: AUTH_SECRET,
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