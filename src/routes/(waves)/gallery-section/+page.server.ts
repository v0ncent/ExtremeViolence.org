import { filteredGalleryPosts } from '$lib/data/blog-posts';

export const prerender = false;

const posts = filteredGalleryPosts.slice(0, filteredGalleryPosts.length)

export async function load() {
  return {
    galleryposts: posts
  };
}