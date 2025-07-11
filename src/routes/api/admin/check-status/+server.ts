import type { RequestHandler } from './$types';
import { AdminService } from '$lib/services/adminService';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const email = url.searchParams.get('email');

		if (!email) {
			return new Response(JSON.stringify({ error: 'Email parameter is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const isAdmin = await AdminService.checkAdminStatusServer(email);

		return new Response(JSON.stringify({ isAdmin }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Admin status check error:', error);
		return new Response(JSON.stringify({ error: 'Failed to check admin status' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
