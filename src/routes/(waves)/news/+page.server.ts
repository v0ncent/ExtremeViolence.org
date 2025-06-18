import { filteredNewsPosts, allNewsPosts } from '$lib/data/blog-posts';

export const prerender = false;

export async function load({ url }) {
	// Get the cache-busting parameter from the URL
	const cacheBuster = url.searchParams.get('_t');

	// Force a reload of the posts by importing them again
	const newsposts = filteredNewsPosts.slice(0, allNewsPosts.length);

	return {
		newsposts,
		cacheBuster // Pass this back to the client
	};
}
