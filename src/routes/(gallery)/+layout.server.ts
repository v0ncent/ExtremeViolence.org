import { filteredGalleryPosts } from '$lib/data/blog-posts';

export async function load({ url }: { url: { pathname: string } }) {
	const { pathname } = url;
	const slug = pathname.replace('/', '');
	const post = filteredGalleryPosts.find((post) => post.slug === slug);

	return {
		post
	};
}
