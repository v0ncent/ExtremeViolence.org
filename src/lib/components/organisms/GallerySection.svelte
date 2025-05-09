<script lang="ts">
	import type { BlogPost } from '$lib/utils/types';
	import GalleryCard from '../molecules/GalleryCard.svelte';

	export let posts: BlogPost[];
</script>

<section class="gallery-section">
	{#each posts as post}
		<GalleryCard {post} />
	{/each}
</section>

<style>
	.gallery-section {
		column-count: 3;
		column-gap: 1rem;
		padding: 1rem 0;
	}
</style>
