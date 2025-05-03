import features from '$lib/data/features';
import { filteredNewsPosts, filteredGalleryPosts } from '$lib/data/blog-posts';

export async function load() {
  const newsposts = filteredNewsPosts.slice(0, 4);
  const galleryposts = filteredGalleryPosts.slice(0,4);

  return {
    features,
    newsposts,
    galleryposts
  };
}
