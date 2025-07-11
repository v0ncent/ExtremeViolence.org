import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeGitHubCode } from '$lib/auth/oauth';
import { createSession, setSessionCookie } from '$lib/auth/session';
import { AdminService } from '$lib/services/adminService';

// Helper to generate a unique userId
function generateUserId() {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	if (!code || !state) {
		throw redirect(302, '/login?error=missing_code_or_state');
	}

	try {
		const user = await exchangeGitHubCode(code);
		// Normalize email
		user.email = user.email.trim().toLowerCase();

		// --- User Data Upload Logic ---
		// 1. Fetch all users
		let allUsers: any[] = [];
		try {
			const res = await fetch('http://localhost:8080/userData/getall');
			if (res.ok) {
				allUsers = await res.json();
			}
		} catch (e) {
			// If DB is empty or unreachable, treat as no users
			allUsers = [];
		}

		// 2. Check if user exists by email
		let backendUser = allUsers.find((u) => u.email === user.email);

		// Fetch admin email list from backend
		let adminEmails: string[] = [];
		try {
			const adminRes = await fetch('http://localhost:8080/admin/getall');
			if (adminRes.ok) {
				const adminData = await adminRes.json();
				if (Array.isArray(adminData)) {
					adminEmails = adminData.map((a: any) => a.email);
				}
			}
		} catch (e) {
			adminEmails = [];
		}
		// Compute admin from adminEmails
		const admin = adminEmails.includes(user.email);

		// Get IP address from request (production ready)
		let ipAddress = '';
		const xff = event.request.headers.get('x-forwarded-for');
		if (xff) {
			ipAddress = xff.split(',')[0].trim();
		} else if (typeof event.getClientAddress === 'function') {
			ipAddress = event.getClientAddress();
		} else {
			ipAddress = '';
		}

		// Check if user is banned
		let isBanned = false;
		try {
			const bannedResponse = await fetch(
				`http://localhost:8080/bannedUsers/get/email/${user.email}`
			);
			isBanned = bannedResponse.ok;
		} catch (e) {
			// If banned users API is unreachable, assume not banned
			isBanned = false;
		}

		if (!backendUser) {
			const newUser = {
				userId: generateUserId(),
				email: user.email,
				authProvider: user.provider,
				admin: admin, // Lombok expects 'admin'
				banned: isBanned,
				imagePath: user.image || '',
				userName: user.email.split('@')[0],
				ipAddress
			};
			try {
				await fetch('http://localhost:8080/userData/createEntry', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newUser)
				});
			} catch (e) {
				// Optionally log error, but don't block login
				console.error('Failed to create user in backend:', e);
			}
		} else {
			// Always update admin and banned status on login using the correct route
			try {
				const updatedUser = {
					...backendUser,
					admin: admin, // Lombok expects 'admin'
					banned: isBanned,
					ipAddress
				};
				await fetch(`http://localhost:8080/userData/update`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(updatedUser)
				});
			} catch (e) {
				console.error('Failed to update user in backend:', e);
			}
		}
		// --- End User Data Upload Logic ---

		const session = createSession(user);
		const cookieHeader = setSessionCookie(session);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
				'Set-Cookie': cookieHeader
			}
		});
	} catch (error) {
		console.error('GitHub OAuth error:', error);
		throw redirect(302, '/login?error=oauth_failed');
	}
};
