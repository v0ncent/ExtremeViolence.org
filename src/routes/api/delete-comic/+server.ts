// src/routes/api/delete-comic/+server.ts
import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE({ request }) {
    const { slug } = await request.json();

    if (!slug) {
        return json({ error: 'Missing slug' }, { status: 400 });
    }

    try {
        // Check if the comic exists before trying to delete
        const postDir = path.join(process.cwd(), 'src', 'routes', '(comic)', slug);
        const markdownPath = path.join(postDir, '+page.md');

        try {
            await fs.access(markdownPath);
        } catch {
            return json({ error: 'Comic not found' }, { status: 404 });
        }

        // Delete the markdown file and directory
        await fs.unlink(markdownPath);
        await fs.rmdir(postDir);

        // Delete the images directory (if it exists)
        const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', slug);
        try {
            await fs.rm(imagesDir, { recursive: true, force: true });
        } catch (error) {
            // Images directory might not exist, which is fine
            console.log('Images directory not found, skipping deletion');
        }

        return json({
            success: true,
            shouldRefresh: true
        });
    } catch (error) {
        console.error('Error deleting comic:', error);
        return json({ error: 'Failed to delete comic' }, { status: 500 });
    }
}