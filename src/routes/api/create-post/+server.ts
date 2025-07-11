import { json } from '@sveltejs/kit';
import { NewsService } from '$lib/services/newsService';
import type { NewsContentModel } from '$lib/utils/types';

export async function POST({ request }) {
	const formData = await request.formData();
	const title = formData.get('title');
	const content = formData.get('content');
	const coverImage = formData.get('coverImage');

	if (!title || !content) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		let formattedCoverImage = '';
		if (coverImage) {
			formattedCoverImage = coverImage.toString().startsWith('/images/posts/')
				? coverImage.toString()
				: `/images/posts/${coverImage.toString()}`;
		}

		const result = await NewsService.createPost({
			title: title.toString(),
			coverImage: formattedCoverImage,
			html: content.toString(),
			// excerpt, tags, etc. can be added here if needed
		} as Omit<NewsContentModel, 'id' | 'postId' | 'date' | 'comments' | 'slug'>);

		return json(result);
	} catch (error: any) {
		console.error('Error creating post:', error);
		return json({ error: error.message || 'Failed to create post' }, { status: 500 });
	}
}
