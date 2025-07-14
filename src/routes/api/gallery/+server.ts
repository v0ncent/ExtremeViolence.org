import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const response = await fetch('http://localhost:8080/gallery/getall');

        if (!response.ok) {
            return json({ error: 'Failed to fetch gallery posts' }, { status: 500 });
        }

        const galleryPosts = await response.json();
        return json(galleryPosts);
    } catch (error) {
        console.error('Error in gallery API:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}; 