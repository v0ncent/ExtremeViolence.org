import { filteredGalleryPosts } from '$lib/data/blog-posts';

export async function load({ params }) {
	const { slug } = params;
	const post = filteredGalleryPosts.find((post) => post.slug === slug);

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
