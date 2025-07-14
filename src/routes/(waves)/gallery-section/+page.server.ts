import { GalleryService } from '$lib/services/galleryService';

export const prerender = false;

export async function load() {
	const galleryposts = await GalleryService.getAllPosts();

	return {
		galleryposts
	};
}
