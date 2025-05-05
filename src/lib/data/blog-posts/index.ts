import { filterPosts, importPosts } from './utils';

// news posts
export const allNewsPosts = importPosts(true, '(blog-article)');
export const filteredNewsPosts = filterPosts(allNewsPosts);

// gallery posts
export const allGalleryPosts = importPosts(true, '(gallery)');
export const filteredGalleryPosts = filterPosts(allGalleryPosts);

// comic posts
export const allComicPosts = importPosts(true, '(comic)');
export const filteredComicPosts = filterPosts(allComicPosts);

export const filteredComicGalleryPosts = filterPosts([...allGalleryPosts, ...allComicPosts]);