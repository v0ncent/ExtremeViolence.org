<script lang="ts">
	import type { GalleryContentModel } from '$lib/utils/types';
	import GalleryImage from '../atoms/GalleryImage.svelte';

	export let post: GalleryContentModel;
	export let size: 'small' | 'medium' | 'large' = 'small';
</script>

<article class="gallery-card {size}">
	<GalleryImage
		src={post.coverImage}
		alt={post.title}
		link={`/gallery/${post.slug}`}
		width={post.width || 0}
		height={post.height || 0}
	/>
	<h3>{post.title}</h3>
</article>

<style>
	.gallery-card {
		box-sizing: border-box;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		width: flex;
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
