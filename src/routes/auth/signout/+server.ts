import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { clearSessionCookie } from "$lib/auth/session";

export const POST: RequestHandler = async () => {
    const cookieHeader = clearSessionCookie();

    return new Response(null, {
        status: 302,
        headers: {
            Location: "/",
            "Set-Cookie": cookieHeader
        }
    });
}; 