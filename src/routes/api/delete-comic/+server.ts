// src/routes/api/delete-comic/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComicsService } from '$lib/services/comicsService';

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { slug } = await request.json();

		if (!slug) {
			return json({ error: 'Comic slug is required' }, { status: 400 });
		}

		const success = await ComicsService.deletePost(slug);

		if (success) {
			return json({ success: true, message: 'Comic deleted successfully' });
		} else {
			return json({ error: 'Failed to delete comic' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error deleting comic:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
