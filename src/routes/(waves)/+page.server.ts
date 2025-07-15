import { features } from '$lib/data/features';
import { NewsService } from '$lib/services/newsService';
import { GalleryService } from '$lib/services/galleryService';
import { ComicsService } from '$lib/services/comicsService';

export const prerender = false;

export async function load({ url }) {
	// Get the cache-busting parameter from the URL
	const cacheBuster = url.searchParams.get('_t');

	// Fetch news posts from database
	const allNewsPosts = await NewsService.getAllPosts();

	// Sort by date (newest first) and take first 4
	const newsposts = allNewsPosts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 4);

	// Fetch gallery posts from database
	const allGalleryPosts = await GalleryService.getAllPosts();
	const galleryandcomicposts = allGalleryPosts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 4);

	// Fetch comic posts from database
	let comicposts = [];
	try {
		const allComicPosts = await ComicsService.getAllPosts();
		comicposts = allComicPosts
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 6);
	} catch (error) {
		console.error('Error loading comics:', error);
		comicposts = [];
	}

	return {
		features,
		newsposts,
		galleryandcomicposts,
		comicposts,
		cacheBuster
	};
}
