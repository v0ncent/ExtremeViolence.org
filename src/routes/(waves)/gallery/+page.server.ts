import { filteredGalleryPosts } from '$lib/data/blog-posts';

export async function load() {
  return {
    newsPosts: filteredGalleryPosts
  };
}