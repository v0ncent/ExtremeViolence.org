import { filterPosts, importPosts } from './utils';

// news posts
export const allNewsPosts = importPosts(true, '(blog-article)');
export const filteredNewsPosts = filterPosts(allNewsPosts);

// gallery posts
export const allGalleryPosts = importPosts(true, '(gallery)');
export const filteredGalleryPosts = filterPosts(allGalleryPosts);