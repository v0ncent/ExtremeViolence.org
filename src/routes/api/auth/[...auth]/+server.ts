import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import { AdminService } from '$lib/services/adminService';

const auth = SvelteKitAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            // Check if user is admin
            const isAdmin = await AdminService.checkIfAdmin(user.email);
            // Add admin status and provider to user object
            const userWithExtras = {
                ...user,
                isAdmin,
                provider: account?.provider as 'google' | 'github'
            };
            Object.assign(user, userWithExtras);

            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user = {
                    ...session.user,
                    // Cast to User type to allow additional properties
                    ...(token as { isAdmin: boolean, provider: 'google' | 'github' })
                };
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // Cast user to include our custom properties
                const userWithExtras = user as typeof user & {
                    isAdmin: boolean;
                    provider: 'google' | 'github';
                };
                token.isAdmin = userWithExtras.isAdmin;
                token.provider = userWithExtras.provider;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
        signOut: '/signout'
    }
});

// Create wrapper functions for API routes
export async function GET(event) {
    return auth.handle({ event, resolve: () => new Response('Not found', { status: 404 }) });
}

export async function POST(event) {
    return auth.handle({ event, resolve: () => new Response('Not found', { status: 404 }) });
}