import { ComicsService } from '$lib/services/comicsService';

export async function load({ params }: { params: { slug: string } }) {
    const { slug } = params;

    if (!slug) {
        return { post: null };
    }

    try {
        const post = await ComicsService.getPostBySlug(slug);
        return { post };
    } catch (error) {
        console.error('Error loading comic post:', error);
        return { post: null };
    }
} 