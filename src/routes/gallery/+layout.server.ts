import { GalleryService } from '$lib/services/galleryService';

export async function load({ url }: { url: { pathname: string } }) {
	const { pathname } = url;

	// Handle the new route structure: /gallery/[slug]
	// Extract slug from pathname like "/gallery/some-slug" -> "some-slug"
	const galleryMatch = pathname.match(/^\/gallery\/([^\/]+)$/);

	if (!galleryMatch) {
		return { post: null };
	}

	const slug = galleryMatch[1];
	const post = await GalleryService.getPostBySlug(slug);

	return {
		post
	};
} 