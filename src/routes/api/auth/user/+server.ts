import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deserializeSession } from '$lib/auth/session';
import { AdminService } from '$lib/services/adminService';

export const GET: RequestHandler = async (event) => {
	const cookies = event.request.headers.get('cookie');

	if (!cookies) {
		return json({ user: null });
	}

	const cookiePairs = cookies.split(';').map((c) => c.trim().split('='));
	const sessionCookie = cookiePairs.find(([name]) => name === 'auth_session')?.[1];

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
	let isAdmin = false;
	let _id = undefined;
	try {
		const res = await fetch(
			`http://localhost:8080/userData/get/email/${encodeURIComponent(session.user.email)}`
		);
		if (res.ok) {
			const backendUser = await res.json();
			if (backendUser) {
				userName = backendUser.userName;
				imagePath = backendUser.imagePath;
				userId = backendUser.userId;
				isAdmin = backendUser.isAdmin ?? backendUser.admin ?? false;
				_id = backendUser.id; // Use 'id' from backend
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
			userId,
			isAdmin,
			_id
		}
	});
};
