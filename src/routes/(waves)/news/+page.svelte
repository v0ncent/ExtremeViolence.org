<script lang="ts">
	import NewsSection from '$lib/components/organisms/NewsSection.svelte';
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';
	import type { NewsContentModel } from '$lib/utils/types';
	import { title } from '$lib/data/meta';

	export let data: {
		newsposts: NewsContentModel[];
	};

	let { newsposts } = data;
</script>

<svelte:head>
	<title>News - {title}</title>
	<meta name="description" content="Latest news and updates from Extreme Violence" />
</svelte:head>

<div class="layout-container">
	<div class="header">
		<h1>News</h1>
		<AdminGuard>
			<a href="/admin/create-post" class="create-post-button">Create Post</a>
		</AdminGuard>
	</div>
	{#if newsposts && newsposts.length > 0}
		<div class="scroll-vertical">
			<NewsSection {newsposts} sectiontitle="All News" sectionid="all-news" />
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.layout-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 32px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;

		h1 {
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

	.scroll-vertical {
		max-height: 600px; // Adjust depending on height of 5 posts
		overflow-y: auto;
		width: 100%;
		padding-right: 8px;
	}

	.scroll-vertical::-webkit-scrollbar {
		width: 8px;
	}

	.scroll-vertical::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	.scroll-vertical::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}

	.scroll-vertical::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
