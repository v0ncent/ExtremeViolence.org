<script lang="ts">
	import NewsSection from '$lib/components/organisms/NewsSection.svelte';
	import RecentPostings from '$lib/components/organisms/RecentPostings.svelte';
	import LatestComics from '$lib/components/organisms/LatestComics.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let data: {
		newsposts: BlogPost[];
	};

	let { newsposts } = data;
</script>

<div class="layout-container">
	<div class="left-column">
		{#if newsposts && newsposts.length > 0}
			<NewsSection {newsposts} />
			<br />
			<RecentPostings {newsposts} />
		{/if}
	</div>

	<div class="right-column">
		{#if newsposts && newsposts.length > 0}
			<LatestComics posts={newsposts} />
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

		max-width: 1200px; // 👈 NEW
		margin: 0 auto; // 👈 NEW (centers the container)

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
