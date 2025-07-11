import { NewsService } from '$lib/services/newsService';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';

export async function load({ params }: { params: { slug: string } }) {
    const { slug } = params;

    // Fetch post from database
    const post = await NewsService.getPostBySlug(slug);

    if (!post) {
        throw error(404, 'Post not found');
    }

    // Convert markdown to HTML for rendering
    let htmlContent = '';
    if (post.html) {
        try {
            htmlContent = marked.parse(post.html) as string;
        } catch (error) {
            console.error('Error parsing markdown:', error);
            htmlContent = post.html;
        }
    }

    // Add excerpt and preview for the post
    const postWithExcerpt = {
        ...post,
        html: htmlContent, // Replace markdown with converted HTML
        excerpt: post.excerpt !== undefined && post.excerpt !== null ? post.excerpt : 'No excerpt available',
        previewHtml: extractPreview(post.html) || '',
        keywords: [],
        hidden: false,
        updated: post.date,
        relatedPosts: [],
        width: 0,
        height: 0,
        series: false
    };

    return {
        post: postWithExcerpt
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