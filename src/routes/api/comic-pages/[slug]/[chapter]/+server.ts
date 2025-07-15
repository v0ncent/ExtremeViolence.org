import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const { slug, chapter } = params;

        if (!slug || !chapter) {
            return json({ error: 'Missing slug or chapter parameter' }, { status: 400 });
        }

        const chapterDir = path.join(process.cwd(), 'static', 'images', 'comics', slug, chapter);

        try {
            const files = await fs.readdir(chapterDir);
            const pageFiles = files
                .filter(file => /^\d+\.jpg$/.test(file))
                .sort((a, b) => {
                    const numA = parseInt(a.replace('.jpg', ''));
                    const numB = parseInt(b.replace('.jpg', ''));
                    return numA - numB;
                });

            const pages = pageFiles.map(file => {
                const number = parseInt(file.replace('.jpg', ''));
                return {
                    path: `/images/comics/${slug}/${chapter}/${file}`,
                    number
                };
            });

            return json({ pages });
        } catch (error) {
            // Chapter directory doesn't exist or is empty
            return json({ pages: [] });
        }
    } catch (error) {
        console.error('Error loading chapter pages:', error);
        return json({ error: 'Failed to load chapter pages' }, { status: 500 });
    }
}; 