import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { deserializeSession } from "$lib/auth/session";

export const GET: RequestHandler = async (event) => {
    const cookies = event.request.headers.get("cookie");

    if (!cookies) {
        return json({ user: null });
    }

    const cookiePairs = cookies.split(";").map(c => c.trim().split("="));
    const sessionCookie = cookiePairs.find(([name]) => name === "auth_session")?.[1];

    if (!sessionCookie) {
        return json({ user: null });
    }

    const session = deserializeSession(sessionCookie);

    if (!session) {
        return json({ user: null });
    }

    return json({ user: session.user });
}; 