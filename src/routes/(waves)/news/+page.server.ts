import { filteredNewsPosts, allNewsPosts } from '$lib/data/blog-posts';

export async function load() {
  const newsposts = filteredNewsPosts.slice(0, allNewsPosts.length);

  return {
    newsposts
  };
}
