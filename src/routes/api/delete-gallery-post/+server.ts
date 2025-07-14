import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { slug } = await request.json();

		if (!slug) {
			return json({ error: 'Missing slug parameter' }, { status: 400 });
		}

		// First get the post to get its ID
		const getResponse = await fetch(`http://localhost:8080/gallery/get/slug/${slug}`);
		if (!getResponse.ok) {
			return json({ error: 'Gallery post not found' }, { status: 404 });
		}

		const post = await getResponse.json();

		// Delete the post using its ID
		const deleteResponse = await fetch(`http://localhost:8080/gallery/delete/id/${post.id}`, {
			method: 'DELETE'
		});

		if (!deleteResponse.ok) {
			return json({ error: 'Failed to delete gallery post' }, { status: 500 });
		}

		return json({
			success: true,
			shouldRefresh: true
		});
	} catch (error) {
		console.error('Error deleting gallery post:', error);
		return json({ error: 'Failed to delete gallery post' }, { status: 500 });
	}
};
