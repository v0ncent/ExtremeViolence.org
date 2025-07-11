import { dev } from '$app/environment';
import type { OAuthUser } from './oauth';

// Generate a new secret every time the server starts
let SESSION_SECRET: string =
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2) + Date.now().toString(36);

export function getSessionSecret() {
	return SESSION_SECRET;
}

export interface Session {
	user: OAuthUser;
	expires: number;
	secret: string; // Add this field to tie session to server run
}

const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function createSession(user: OAuthUser): Session {
	return {
		user,
		expires: Date.now() + SESSION_DURATION,
		secret: getSessionSecret()
	};
}

export function isSessionValid(session: Session): boolean {
	// Session is only valid if not expired AND secret matches current server secret
	return session.expires > Date.now() && session.secret === getSessionSecret();
}

export function serializeSession(session: Session): string {
	return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function deserializeSession(serialized: string): Session | null {
	try {
		const decoded = Buffer.from(serialized, 'base64').toString();
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
		'HttpOnly',
		// Only set Secure in production
		!dev ? 'Secure' : '',
		'SameSite=Lax',
		`Max-Age=${SESSION_DURATION / 1000}`,
		'Path=/'
		// Do not set Domain for localhost or in dev
	].filter(Boolean);

	return cookieOptions.join('; ');
}

export function clearSessionCookie(): string {
	return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
}
