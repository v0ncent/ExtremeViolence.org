import { json } from '@sveltejs/kit';
import { NewsService } from '$lib/services/newsService';
import type { NewsContentModel } from '$lib/utils/types';

export async function PUT({ request }) {
	const formData = await request.formData();
	const slug = formData.get('slug');
	const title = formData.get('title');
	const content = formData.get('content');
	const coverImage = formData.get('coverImage');

	if (!slug || !title || !content) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		let formattedCoverImage = '';
		if (coverImage) {
			formattedCoverImage = coverImage.toString().startsWith('/images/posts/')
				? coverImage.toString()
				: `/images/posts/${coverImage.toString()}`;
		}

		const success = await NewsService.updatePost(slug.toString(), {
			title: title.toString(),
			html: content.toString(),
			coverImage: formattedCoverImage
		} as Partial<NewsContentModel>);

		if (!success) {
			return json({ error: 'Failed to update post' }, { status: 500 });
		}

		return json({
			success: true,
			slug
		});
	} catch (error: any) {
		console.error('Error editing post:', error);
		return json({ error: error.message || 'Failed to edit post' }, { status: 500 });
	}
}
