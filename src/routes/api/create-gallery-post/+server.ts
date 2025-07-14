import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const title = formData.get('title')?.toString();
		const coverImage = formData.get('coverImage')?.toString();
		const date = formData.get('date')?.toString() || new Date().toISOString();
		const width = parseInt(formData.get('width')?.toString() || '0');
		const height = parseInt(formData.get('height')?.toString() || '0');

		if (!title || !coverImage) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const postData = {
			title,
			coverImage,
			date,
			width,
			height
		};

		const response = await fetch('http://localhost:8080/gallery/createEntry', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(postData)
		});

		if (!response.ok) {
			const errorData = await response.json();
			return json({ error: errorData.message || 'Failed to create gallery post' }, { status: 500 });
		}

		const result = await response.json();
		return json({
			success: true,
			slug: result.slug,
			shouldRefresh: true
		});
	} catch (error) {
		console.error('Error creating gallery post:', error);
		return json({ error: 'Failed to create gallery post' }, { status: 500 });
	}
};
