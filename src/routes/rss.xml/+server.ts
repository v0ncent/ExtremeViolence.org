import { description, siteBaseUrl, title } from '$lib/data/meta';
import type { NewsContentModel } from '$lib/utils/types';
import dateformat from 'dateformat';
import { NewsService } from '$lib/services/newsService';
import { marked } from 'marked';

export const prerender = false;

export async function GET() {
	// Fetch posts from database
	const allNewsPosts = await NewsService.getAllPosts();

	// Sort by date (newest first) and add excerpts
	const filteredPosts = await Promise.all(
		allNewsPosts
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.map(async (post) => {
				// Convert markdown to HTML for RSS content
				const htmlContent = post.html ? await marked.parse(post.html) : '';
				return {
					...post,
					html: htmlContent, // Replace markdown with converted HTML
					excerpt:
						post.excerpt !== undefined && post.excerpt !== null
							? post.excerpt
							: 'No excerpt available',
					keywords: [],
					hidden: false,
					updated: post.date,
					relatedPosts: [],
					width: 0,
					height: 0,
					series: false
				};
			})
	);

	const body = xml(filteredPosts);
	const headers = {
		'Cache-Control': 'max-age=0, s-maxage=3600',
		'Content-Type': 'application/xml'
	};
	return new Response(body, { headers });
}

// Helper function to generate excerpt from HTML content
function generateExcerpt(html: string): string {
	if (!html) return '';

	// Remove HTML tags and get plain text
	const text = html.replace(/<[^>]*>/g, '');

	// Take first 100 characters and add ellipsis if longer
	return text.length > 100 ? text.substring(0, 100) + '...' : text;
}

const xml = (posts: NewsContentModel[]) => `
<rss version="2.0"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
	xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
	xmlns:georss="http://www.georss.org/georss"
	xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"
>
  <channel>
    <atom:link href="${siteBaseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <title>${title}</title>
    <link>${siteBaseUrl}</link>
    <description>${description}</description>
    <image>
      <url>${siteBaseUrl}/favicons/favicon-32x32.png</url>
      <title>${title}</title>
      <link>${siteBaseUrl}</link>
      <width>32</width>
      <height>32</height>
    </image>
    ${posts
		.map(
			(post) => `
        <item>
          <guid>${siteBaseUrl}/${post.slug}</guid>
          <title>${post.title}</title>
          <description>${post.excerpt}</description>
          <link>${siteBaseUrl}/${post.slug}</link>
          <pubDate>${dateformat(post.date, 'ddd, dd mmm yyyy HH:MM:ss o')}</pubDate>
          ${post.tags ? `<category>${post.tags}</category>` : ''}
          <content:encoded><![CDATA[
            <div style="margin: 50px 0; font-style: italic;">
              If anything looks wrong, 
              <strong>
                <a href="${siteBaseUrl}/${post.slug}">
                  read on the site!
                </a>
              </strong>
            </div>

            ${post.html}
          ]]></content:encoded>
          ${post.coverImage
					? `<media:thumbnail xmlns:media="http://search.yahoo.com/mrss/" url="${siteBaseUrl}/${post.coverImage}"/>`
					: ''
				}
          ${post.coverImage
					? `<media:content xmlns:media="http://search.yahoo.com/mrss/" medium="image" url="${siteBaseUrl}/${post.coverImage}"/>`
					: ''
				}          
        </item>
      `
		)
		.join('')}
  </channel>
</rss>`;
