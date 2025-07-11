import { json } from '@sveltejs/kit';
import { NewsService } from '$lib/services/newsService';

export async function DELETE({ request }) {
	const { slug } = await request.json();

	if (!slug) {
		return json({ error: 'Missing slug parameter' }, { status: 400 });
	}

	try {
		const success = await NewsService.deletePost(slug);

		if (!success) {
			return json({ error: 'Failed to delete post' }, { status: 500 });
		}

		return json({
			success: true
		});
	} catch (error: any) {
		console.error('Error deleting post:', error);
		return json({ error: error.message || 'Failed to delete post' }, { status: 500 });
	}
}
