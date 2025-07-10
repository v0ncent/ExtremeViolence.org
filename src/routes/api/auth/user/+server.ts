import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { deserializeSession } from "$lib/auth/session";
import { AdminService } from "$lib/services/adminService";

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

    // Fetch user profile from backend
    let userName = undefined;
    let imagePath = undefined;
    let userId = undefined;
    try {
        const res = await fetch("http://localhost:8080/userData/getall");
        if (res.ok) {
            const allUsers = await res.json();
            const backendUser = allUsers.find((u: any) => u.email === session.user.email);
            if (backendUser) {
                userName = backendUser.userName;
                imagePath = backendUser.imagePath;
                userId = backendUser.userId;
            }
        }
    } catch (e) {
        // Ignore errors, fallback to session user only
    }

    return json({
        user: {
            ...session.user,
            userName,
            imagePath,
            userId
        }
    });
}; 