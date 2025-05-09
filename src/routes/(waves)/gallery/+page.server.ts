import { filteredGalleryPosts, allGalleryPosts } from '$lib/data/blog-posts';

const posts = filteredGalleryPosts.slice(0, allGalleryPosts.length)

export async function load() {
  return {
    galleryposts: posts
  };
}