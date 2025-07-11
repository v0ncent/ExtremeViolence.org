import { NewsService } from '$lib/services/newsService';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;
	const post = await NewsService.getPostBySlug(slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
}
