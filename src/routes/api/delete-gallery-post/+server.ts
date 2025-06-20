import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE({ request }) {
	const { slug } = await request.json();

	if (!slug) {
		return json({ error: 'Missing slug parameter' }, { status: 400 });
	}

	try {
		const postDir = path.join(process.cwd(), 'src', 'routes', '(gallery)', slug);

		// Check if directory exists
		try {
			await fs.access(postDir);
		} catch {
			return json({ error: 'Gallery post not found' }, { status: 404 });
		}

		// Delete the post directory and its contents
		await fs.rm(postDir, { recursive: true, force: true });

		return json({
			success: true,
			shouldRefresh: true
		});
	} catch (error) {
		console.error('Error deleting gallery post:', error);
		return json({ error: 'Failed to delete gallery post' }, { status: 500 });
	}
}
