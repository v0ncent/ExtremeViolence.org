import { NewsService } from '$lib/services/newsService';
import { marked } from 'marked';

export const prerender = false;

export async function load({ url }) {
	// Get the cache-busting parameter from the URL
	const cacheBuster = url.searchParams.get('_t');

	// Fetch posts from database
	const allNewsPosts = await NewsService.getAllPosts();

	// Sort by date (newest first) and add excerpts/previews
	const newsposts = allNewsPosts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.map((post) => {
			// Convert markdown to HTML for preview generation
			const htmlContent = post.html ? marked.parse(post.html) : '';
			return {
				...post,
				html: htmlContent, // Replace markdown with converted HTML
				excerpt:
					post.excerpt !== undefined && post.excerpt !== null
						? post.excerpt
						: 'No excerpt available',
				previewHtml: extractPreview(post.html) || '',
				keywords: [],
				hidden: false,
				updated: post.date,
				relatedPosts: [],
				width: 0,
				height: 0,
				series: false
			};
		});

	return {
		newsposts,
		cacheBuster // Pass this back to the client
	};
}

// Helper function to generate excerpt from HTML content
function generateExcerpt(html: string): string {
	if (!html) return '';

	// Remove HTML tags and get plain text
	const text = html.replace(/<[^>]*>/g, '');

	// Take first 100 characters and add ellipsis if longer
	return text.length > 100 ? text.substring(0, 100) + '...' : text;
}

// Helper function to extract preview HTML (first paragraph)
function extractPreview(html: string): string {
	if (!html) return '';

	// Find the first paragraph or div
	const match = html.match(/<(p|div)[^>]*>(.*?)<\/\1>/s);
	if (match) {
		return match[0];
	}

	// If no paragraph found, return first 200 characters of text
	const text = html.replace(/<[^>]*>/g, '');
	return text.length > 200 ? text.substring(0, 200) + '...' : text;
}
