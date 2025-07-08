import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { exchangeGoogleCode } from "$lib/auth/oauth";
import { createSession, setSessionCookie } from "$lib/auth/session";

export const GET: RequestHandler = async (event) => {
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");

    if (!code || !state) {
        throw redirect(302, "/login?error=missing_code_or_state");
    }

    try {
        const user = await exchangeGoogleCode(code);
        const session = createSession(user);
        const cookieHeader = setSessionCookie(session);

        return new Response(null, {
            status: 302,
            headers: {
                Location: "/profile",
                "Set-Cookie": cookieHeader
            }
        });
    } catch (error) {
        console.error("Google OAuth error:", error);
        throw redirect(302, "/login?error=oauth_failed");
    }
}; 