<script lang="ts">
	import NewsSection from '$lib/components/organisms/NewsSection.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let data: {
		newsposts: BlogPost[];
	};

	let { newsposts } = data;
</script>

<div class="layout-container">
	{#if newsposts && newsposts.length > 0}
		<div class="scroll-vertical">
			<NewsSection {newsposts} sectiontitle="All News" sectionid="all-news"/>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.layout-container {
		display: flex;
		justify-content: center;
		padding: 32px;
		max-width: 1200px;
		margin: 0 auto;
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
