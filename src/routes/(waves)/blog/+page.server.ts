import { filteredNewsPosts } from '$lib/data/blog-posts';

export async function load() {
	return {
		newsPosts: filteredNewsPosts
	};
}
