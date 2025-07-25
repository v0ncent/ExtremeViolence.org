<script lang="ts">
	import NewsSection from '$lib/components/organisms/NewsSection.svelte';
	import RecentPostings from '$lib/components/organisms/RecentPostings.svelte';
	import LatestComics from '$lib/components/organisms/LatestComics.svelte';
	import ContentWarning from '$lib/components/organisms/ContentWarning.svelte';
	import Foxy from '$lib/components/atoms/Foxy.svelte';
	import { onMount } from 'svelte';
	import type { NewsContentModel, ComicsContentModel, GalleryContentModel } from '$lib/utils/types';
	import { title, description } from '$lib/data/meta';

	export let data: {
		newsposts: NewsContentModel[];
		galleryandcomicposts: GalleryContentModel[];
		comicposts: ComicsContentModel[];
	};

	let { newsposts, galleryandcomicposts, comicposts } = data;

	let showWarning = true;

	onMount(() => {
		const accepted = localStorage.getItem('content-warning-accepted');
		if (accepted === 'true') {
			showWarning = false;
		}
	});

	function acceptWarning() {
		localStorage.setItem('content-warning-accepted', 'true');
		showWarning = false;
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
</svelte:head>

{#if showWarning}
	<ContentWarning onAccept={acceptWarning} />
{:else}
	<div class="layout-container">
		<div class="left-column">
			{#if newsposts && newsposts.length > 0}
				<NewsSection {newsposts} sectiontitle="Recent News" sectionid="recent-news" />
				<br />
			{/if}

			{#if galleryandcomicposts && galleryandcomicposts.length > 0}
				<RecentPostings {galleryandcomicposts} />
			{/if}
		</div>

		<div class="right-column">
			{#if comicposts && comicposts.length > 0}
				<LatestComics posts={comicposts} sectiontitle="Latest Comics" />
			{/if}
		</div>
	</div>

	<Foxy />
{/if}

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.layout-container {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 32px;
		padding: 32px;
		max-width: 1200px;
		margin: 0 auto;
		opacity: 0.9;

		@include for-phone-only {
			grid-template-columns: 1fr;
		}
	}

	.left-column,
	.right-column {
		padding: 16px;
		border-radius: 8px;
		opacity: 0.9;
	}

	:global(.content-warning) {
		opacity: 0.9;
	}
</style>
