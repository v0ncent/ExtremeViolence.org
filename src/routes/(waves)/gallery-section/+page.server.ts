import { filteredGalleryPosts } from '$lib/data/blog-posts';

export const prerender = false;

export async function load() {
	return {
		galleryposts: filteredGalleryPosts
	};
}
