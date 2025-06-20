import { filteredComicPosts } from '$lib/data/blog-posts';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { slug } = params;
    const post = filteredComicPosts.find((post) => post.slug === slug);

    if (!post) {
        throw error(404, 'Comic not found');
    }

    return {
        post
    };
}