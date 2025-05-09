<script lang="ts">
	import GallerySection from '$lib/components/organisms/GallerySection.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let data: {
		galleryposts: BlogPost[];
	};

	let posts = data.galleryposts;
</script>

<div class="layout-container">
	<GallerySection {posts} />
</div>

<style>
	.layout-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
</style>
