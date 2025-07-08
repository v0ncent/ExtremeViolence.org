import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getGitHubAuthUrl } from "$lib/auth/oauth";
import crypto from "crypto";

export const GET: RequestHandler = async () => {
    const state = crypto.randomBytes(32).toString("hex");
    const authUrl = getGitHubAuthUrl(state);

    // In a real implementation, you'd store the state to verify it later
    // For now, we'll redirect directly
    throw redirect(302, authUrl);
}; 