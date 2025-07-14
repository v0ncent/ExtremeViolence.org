import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const slug = formData.get('slug')?.toString();
		const title = formData.get('title')?.toString();
		const coverImage = formData.get('coverImage')?.toString();
		const date = formData.get('date')?.toString();

		if (!slug || !title) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// First get the current post to preserve existing data
		const getResponse = await fetch(`http://localhost:8080/gallery/get/slug/${slug}`);
		if (!getResponse.ok) {
			return json({ error: 'Gallery post not found' }, { status: 404 });
		}

		const currentPost = await getResponse.json();

		// Update the post with new data
		const updatedPost = {
			...currentPost,
			title,
			coverImage: coverImage || currentPost.coverImage,
			date: date || currentPost.date
		};

		const updateResponse = await fetch('http://localhost:8080/gallery/update', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedPost)
		});

		if (!updateResponse.ok) {
			const errorData = await updateResponse.json();
			return json({ error: errorData.message || 'Failed to update gallery post' }, { status: 500 });
		}

		return json({
			success: true,
			shouldRefresh: true
		});
	} catch (error) {
		console.error('Error updating gallery post:', error);
		return json({ error: 'Failed to update gallery post' }, { status: 500 });
	}
};
