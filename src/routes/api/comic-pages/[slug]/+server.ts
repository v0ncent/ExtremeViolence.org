import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function GET({ params }) {
    const { slug } = params;

    if (!slug) {
        return json({ error: 'Missing slug' }, { status: 400 });
    }

    try {
        const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', slug);

        // Check if directory exists
        try {
            await fs.access(imagesDir);
        } catch {
            return json({ pages: [] });
        }

        // Read all files in the directory
        const files = await fs.readdir(imagesDir);

        // Filter for numbered jpg files (1.jpg, 2.jpg, etc.)
        const pageFiles = files
            .filter(file => /^\d+\.jpg$/.test(file))
            .map(file => file.replace('.jpg', ''))
            .sort((a, b) => parseInt(a) - parseInt(b));

        return json({ pages: pageFiles });
    } catch (error) {
        console.error('Error loading comic pages:', error);
        return json({ error: 'Failed to load comic pages' }, { status: 500 });
    }
}
