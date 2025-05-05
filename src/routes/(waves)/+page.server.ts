import features from '$lib/data/features';
import { filteredNewsPosts, filteredComicGalleryPosts, filteredComicPosts } from '$lib/data/blog-posts';

export async function load() {
  const newsposts = filteredNewsPosts.slice(0, 4);
  const galleryandcomicposts = filteredComicGalleryPosts.slice(0,4);
  const comicposts = filteredComicPosts.slice(0,6);

  return {
    features,
    newsposts,
    galleryandcomicposts,
    comicposts
  };
}
