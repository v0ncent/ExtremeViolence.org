import { GalleryService } from '$lib/services/galleryService';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;
	
	// Try to get post by slug first
	let post = await GalleryService.getPostBySlug(slug);
	
	// If not found by slug, try by ID (in case slug is actually a UUID)
	if (!post) {
		post = await GalleryService.getPostById(slug);
	}

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
}
