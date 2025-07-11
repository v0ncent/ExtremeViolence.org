import features from '$lib/data/features';
import { NewsService } from '$lib/services/newsService';
import { filteredComicGalleryPosts, filteredComicPosts } from '$lib/data/blog-posts';
import { marked } from 'marked';

export const prerender = false;

export async function load({ url }) {
	// Get the cache-busting parameter from the URL
	const cacheBuster = url.searchParams.get('_t');

	// Fetch news posts from database
	const allNewsPosts = await NewsService.getAllPosts();

	// Sort by date (newest first) and take first 4
	const newsposts = allNewsPosts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 4)
		.map((post) => {
			// Convert markdown to HTML for preview generation
			const htmlContent = post.html
				? typeof marked.parse === 'function'
					? marked.parse(post.html)
					: ''
				: '';
			const htmlString = typeof htmlContent === 'string' ? htmlContent : '';
			// Use the first paragraph of the HTML as previewHtml
			let previewHtml = '';
			if (htmlString) {
				const match = htmlString.match(/<(p|div)[^>]*>(.*?)<\/\1>/s);
				if (match) {
					previewHtml = match[0];
				} else {
					// fallback: use first 1000 chars of HTML
					const text = htmlString.replace(/<[^>]*>/g, '');
					if (text.length > 1000) {
						previewHtml =
							text.substring(0, 1000) +
							'<span style="color: red; font-weight: 500; cursor: pointer;"> ...Read More!</span>';
					} else {
						previewHtml = text;
					}
				}
			}
			return {
				...post,
				html: htmlString, // Replace markdown with converted HTML
				excerpt:
					post.excerpt !== undefined && post.excerpt !== null
						? post.excerpt
						: 'No excerpt available',
				previewHtml,
				keywords: [],
				hidden: false,
				updated: post.date,
				relatedPosts: [],
				width: 0,
				height: 0,
				series: false
			};
		});

	const galleryandcomicposts = filteredComicGalleryPosts.slice(0, 4);
	const comicposts = filteredComicPosts.slice(0, 6);

	return {
		features,
		newsposts,
		galleryandcomicposts,
		comicposts,
		cacheBuster
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
