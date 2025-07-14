import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const { slug } = params;

        if (!slug) {
            return json({ error: 'Gallery slug is required' }, { status: 400 });
        }

        const response = await fetch(`http://localhost:8080/gallery/get/slug/${slug}`);

        if (!response.ok) {
            return json({ error: 'Gallery post not found' }, { status: 404 });
        }

        const galleryPost = await response.json();
        return json(galleryPost);
    } catch (error) {
        console.error('Error in gallery API:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}; 