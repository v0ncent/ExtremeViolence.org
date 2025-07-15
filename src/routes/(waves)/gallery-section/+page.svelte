<script lang="ts">
	import GallerySection from '$lib/components/organisms/GallerySection.svelte';
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';
	import type { GalleryContentModel } from '$lib/utils/types';
	import { title } from '$lib/data/meta';

	export let data: {
		galleryposts: GalleryContentModel[];
	};

	let posts = data.galleryposts;
</script>

<svelte:head>
	<title>Gallery - {title}</title>
	<meta name="description" content="Art gallery featuring works by Vincent Banks" />
</svelte:head>

<div class="layout-container">
	<div class="header">
		<h1>Gallery</h1>
		<AdminGuard>
			<a href="/admin/create-gallery-post" class="create-post-button">Create Post</a>
		</AdminGuard>
	</div>
	<GallerySection {posts} />
</div>

<style lang="scss">
	.layout-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;

		.h1 {
			margin: 0;
		}
	}

	.create-post-button {
		padding: 0.5rem 1rem;
		background-color: var(--color--primary);
		color: white;
		border-radius: 8px;
		font-weight: bold;
		text-decoration: none;
		transition: 0.3s;

		&:hover {
			background-color: var(--color--primary-dark);
			filter: drop-shadow(0px 0px 5px var(--color--primary));
		}
	}
</style>
