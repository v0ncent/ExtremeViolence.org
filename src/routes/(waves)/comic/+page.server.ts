import { filteredComicPosts } from '$lib/data/blog-posts';

export async function load() {
  return {
    newsPosts: filteredComicPosts
  };
}