import { NewsService } from '$lib/services/newsService';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;
	
	// Try to get post by slug first
	let post = await NewsService.getPostBySlug(slug);
	
	// If not found by slug, try by ID (in case slug is actually a UUID)
	if (!post) {
		post = await NewsService.getPostById(slug);
	}

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
}
