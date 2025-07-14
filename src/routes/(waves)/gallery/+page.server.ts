import { GalleryService } from '$lib/services/galleryService';

export async function load() {
	try {
		const galleryposts = await GalleryService.getAllPosts();
		return {
			galleryposts
		};
	} catch (error) {
		console.error('Error loading gallery posts:', error);
		return {
			galleryposts: []
		};
	}
}
