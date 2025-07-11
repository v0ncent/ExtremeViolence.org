import { json } from '@sveltejs/kit';
import { NewsService } from '$lib/services/newsService';

export async function POST({ request }) {
	const { postId, userId, text } = await request.json();

	if (!postId || !userId || !text) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		const success = await NewsService.addComment(postId, userId, text);

		if (!success) {
			return json({ error: 'Failed to add comment' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error: any) {
		console.error('Error adding comment:', error);
		return json({ error: error.message || 'Failed to add comment' }, { status: 500 });
	}
}

export async function PUT({ request }) {
	const { postId, commentId, newText } = await request.json();

	if (!postId || !commentId || !newText) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		const success = await NewsService.updateComment(postId, commentId, newText);

		if (!success) {
			return json({ error: 'Failed to update comment' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error: any) {
		console.error('Error updating comment:', error);
		return json({ error: error.message || 'Failed to update comment' }, { status: 500 });
	}
}

export async function DELETE({ request }) {
	const { postId, commentId } = await request.json();

	if (!postId || !commentId) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		const success = await NewsService.deleteComment(postId, commentId);

		if (!success) {
			return json({ error: 'Failed to delete comment' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error: any) {
		console.error('Error deleting comment:', error);
		return json({ error: error.message || 'Failed to delete comment' }, { status: 500 });
	}
}
