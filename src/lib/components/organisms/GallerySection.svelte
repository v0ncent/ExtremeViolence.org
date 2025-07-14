<script lang="ts">
	import type { GalleryContentModel } from '$lib/utils/types';
	import GalleryCard from '../molecules/GalleryCard.svelte';

	export let posts: GalleryContentModel[];

	type Size = 'small' | 'medium' | 'large';

	function getSizeFromResolution(width: number, height: number): Size {
		const resolution = width * height;

		if (resolution >= 1290282) return 'large'; // 2MP+
		if (resolution >= 1290282 / 2) return 'medium'; // ~0.8MP+
		return 'small';
	}

	let sizedPosts = posts.map((post) => {
		const size = getSizeFromResolution(post.width || 0, post.height || 0);
		return { ...post, size };
	});
</script>

<section class="gallery-grid">
	{#each sizedPosts as post}
		<GalleryCard {post} size={post.size} />
	{/each}
</section>

<style>
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}
</style>
