<script lang="ts">
	import NewsSection from '$lib/components/organisms/NewsSection.svelte';
	import RecentPostings from '$lib/components/organisms/RecentPostings.svelte';
	import LatestComics from '$lib/components/organisms/LatestComics.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let data: {
		newsposts: BlogPost[];
		galleryandcomicposts: BlogPost[];
		comicposts: BlogPost[];
	};


	let { newsposts, galleryandcomicposts, comicposts } = data;
</script>

<div class="layout-container">
	<div class="left-column">
		{#if newsposts && newsposts.length > 0}
			<NewsSection {newsposts} />
			<br />
		{/if}

		{#if galleryandcomicposts && galleryandcomicposts.length > 0}
			<RecentPostings {galleryandcomicposts} />
		{/if}
	</div>	

	<div class="right-column">
		{#if comicposts && comicposts.length > 0}
			<LatestComics posts={comicposts} />
		{/if}
	</div>
</div>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';
	.layout-container {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 32px;
		padding: 32px;

		max-width: 1200px; 
		margin: 0 auto; 

		@include for-phone-only {
			grid-template-columns: 1fr;
		}
	}

	.left-column {
		padding: 16px;
		border-radius: 8px;
	}

	.right-column {
		padding: 16px;
		border-radius: 8px;
	}
</style>
