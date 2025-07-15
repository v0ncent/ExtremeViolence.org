import { ComicsService } from '$lib/services/comicsService';

export async function load() {
	try {
		const comicPosts = await ComicsService.getAllPosts();
		return {
			comicPosts,
			backendError: null
		};
	} catch (error) {
		console.error('Error loading comic posts:', error);
		return {
			comicPosts: [],
			backendError: 'Failed to load comics from database'
		};
	}
}
