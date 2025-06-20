import { filteredNewsPosts } from '$lib/data/blog-posts';

export async function load({ params }) {
	const { slug } = params;
	const post = filteredNewsPosts.find((post) => post.slug === slug);

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
