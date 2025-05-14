<script lang="ts">
	import type { BlogPost } from '$lib/utils/types';
	import GalleryImage from '../atoms/GalleryImage.svelte';

	export let post: BlogPost;
	export let size: 'small' | 'medium' | 'large' = 'small';
</script>

<article class="gallery-card {size}">
	<GalleryImage
		src={post.coverImage}
		alt={post.title}
		link={post.slug}
		width={post.width}
		height={post.height}
	/>
	<h3>{post.title}</h3>
</article>

<style>
	.gallery-card {
		box-sizing: border-box;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease;
		width: 100%;
		break-inside: avoid;
	}

	.gallery-card:hover {
		transform: scale(1.02);
	}

	.gallery-card.small {
		grid-column: span 1;
	}

	.gallery-card.medium {
		grid-column: span 2;
	}

	.gallery-card.large {
		grid-column: span 3;
		justify-self: center;
	}
</style>
