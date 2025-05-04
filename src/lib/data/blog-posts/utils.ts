// Disabling eslint because importing Prism is needed
// even if not directly used in this file
// eslint-disable-next-line no-unused-vars
import Prism from 'prismjs';
// Here we assign it to a variable so the import above 
// is not removed automatically on build
const ifYouRemoveMeTheBuildFails = Prism;
import 'prism-svelte';
import readingTime from 'reading-time/lib/reading-time';
import striptags from 'striptags';
import type { BlogPost } from "$lib/utils/types";

export const importPosts = (render = false, route: string) => {
  const blogImports = import.meta.glob('$routes/**/*.md', { eager: true });

  const posts: BlogPost[] = [];
  for (const path in blogImports) {
    if (!path.includes(route)) continue;
  
    const post = blogImports[path] as any;
    if (post) {
      posts.push({
        ...post.metadata,
        html: render && post.default?.render ? post.default.render()?.html : undefined,
      });
    }
  }
  

  return posts;
}

export const filterPosts = (posts: BlogPost[]) => {
  return posts.filter((post) => !post.hidden)
    .sort((a, b) =>
      new Date(a.date).getTime() > new Date(b.date).getTime()
        ? -1
        : new Date(a.date).getTime() < new Date(b.date).getTime()
          ? 1
          : 0
    )
    .map((post) => {
      const readingTimeResult = post.html ? readingTime(striptags(post.html) || '') : undefined;
      const relatedPosts = getRelatedNewsPosts(posts, post);

      // for news articles showing more in the card we truncate the
      const prieviewHtml = post.html ? extractPreview(post.html) : undefined;

      return {
        ...post,
        readingTime: readingTimeResult ? readingTimeResult.text : '',
        relatedPosts: relatedPosts,
        prieviewHtml: prieviewHtml
      } as BlogPost;
    });
}

// #region Unexported Functions

const getRelatedNewsPosts = (posts: BlogPost[], post: BlogPost) => {
  // Get the first 3 posts that have the highest number of tags in common
  const relatedPosts = posts
    .filter((p) => !p.hidden && p.slug !== post.slug)
    .sort((a, b) => {
      const aTags = a.tags?.filter((t: any) => post.tags?.includes(t));
      const bTags = b.tags?.filter((t: any) => post.tags?.includes(t));
      return aTags?.length > bTags?.length ? -1 : aTags?.length < bTags?.length ? 1 : 0;
    })

  return relatedPosts.slice(0, 3).map((p) => ({
    ...p,
    readingTime: p.html ? readingTime(striptags(p.html) || '').text : '',
  }));
}

function extractPreview(html: string, charLimit = 1000): string {
  const match = html.match(/<p>(.*?)<\/p>/i);
  let text: string;

  if (match && match[1]) {
    text = striptags(match[1]);
  } else {
    text = striptags(html).slice(0, charLimit);
  }

  if (text.length > charLimit) {
    return (
      text.slice(0, charLimit) +
      '<span class="read-more"> ...Click to read more!</span>'
    );
  }

  return text;
}


// #endregion