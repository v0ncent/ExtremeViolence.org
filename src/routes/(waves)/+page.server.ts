import features from '$lib/data/features';
import {
	filteredNewsPosts,
	filteredComicGalleryPosts,
	filteredComicPosts
} from '$lib/data/blog-posts';

export const prerender = false;

export async function load({ url }) {
	// Get the cache-busting parameter from the URL
	const cacheBuster = url.searchParams.get('_t');

	const newsposts = filteredNewsPosts.slice(0, 4);
	const galleryandcomicposts = filteredComicGalleryPosts.slice(0, 4);
	const comicposts = filteredComicPosts.slice(0, 6);

	return {
		features,
		newsposts,
		galleryandcomicposts,
		comicposts,
		cacheBuster
	};
}
