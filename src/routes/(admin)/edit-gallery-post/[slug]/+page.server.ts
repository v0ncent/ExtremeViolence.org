import { GalleryService } from '$lib/services/galleryService';

export async function load({ params }) {
	const { slug } = params;
	const post = await GalleryService.getPostBySlug(slug);

	if (!post) {
		return {
			status: 404,
			error: 'Post not found'
		};
	}

	return {
		post
	};
}
