import { ComicsService } from '$lib/services/comicsService';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	try {
		const post = await ComicsService.getPostBySlug(slug);

		if (!post) {
			throw error(404, 'Comic not found');
		}

		return {
			post
		};
	} catch (err) {
		console.error('Error loading comic for edit:', err);
		throw error(500, 'Failed to load comic');
	}
}
