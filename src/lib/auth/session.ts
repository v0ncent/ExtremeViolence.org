import { dev } from "$app/environment";
import type { OAuthUser } from "./oauth";

export interface Session {
    user: OAuthUser;
    expires: number;
}

const SESSION_COOKIE_NAME = "auth_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function createSession(user: OAuthUser): Session {
    return {
        user,
        expires: Date.now() + SESSION_DURATION
    };
}

export function isSessionValid(session: Session): boolean {
    return session.expires > Date.now();
}

export function serializeSession(session: Session): string {
    return Buffer.from(JSON.stringify(session)).toString("base64");
}

export function deserializeSession(serialized: string): Session | null {
    try {
        const decoded = Buffer.from(serialized, "base64").toString();
        const session = JSON.parse(decoded) as Session;
        return isSessionValid(session) ? session : null;
    } catch {
        return null;
    }
}

export function setSessionCookie(session: Session): string {
    const serialized = serializeSession(session);
    const cookieOptions = [
        `${SESSION_COOKIE_NAME}=${serialized}`,
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        `Max-Age=${SESSION_DURATION / 1000}`,
        dev ? "" : "Domain=localhost"
    ].filter(Boolean);

    return cookieOptions.join("; ");
}

export function clearSessionCookie(): string {
    return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
} 