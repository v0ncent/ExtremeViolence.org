<script lang="ts">
	import type { BlogPost } from '$lib/utils/types';
	import GalleryImage from '../atoms/GalleryImage.svelte';

	export let post: BlogPost;
</script>

<article class="gallery-card">
	<GalleryImage src={post.coverImage} alt={post.title} link={post.slug} />
	<h3>{post.title}</h3>
</article>

<style>
	.gallery-card {
		break-inside: avoid;
		margin-bottom: 1rem;
		width: 100%;
		box-sizing: border-box;
		padding: 0.5rem;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>
