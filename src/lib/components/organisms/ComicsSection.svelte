<script lang="ts">
	import ComicCard from '$lib/components/molecules/ComicCard.svelte';
	import type { ComicsContentModel } from '$lib/utils/types';

	export let posts: ComicsContentModel[];

	// Separate posts into series and short stories
	$: seriesPosts = posts.filter((post) => post.series === true);
	$: shortStoryPosts = posts.filter((post) => post.series === false || post.series === undefined);
</script>

<section class="comics-grid-section">
	{#if seriesPosts.length > 0}
		<div class="section-group">
			<h2 class="section-title">Series</h2>
			<div class="grid">
				{#each seriesPosts as post}
					<ComicCard
						slug={post.slug}
						title={post.title}
						excerpt={post.excerpt}
						coverImage={post.coverImage}
						showImage={true}
						small={true}
					/>
				{/each}
			</div>
		</div>
	{/if}

	{#if shortStoryPosts.length > 0}
		<div class="section-group">
			<h2 class="section-title">Short Stories</h2>
			<div class="grid">
				{#each shortStoryPosts as post}
					<ComicCard
						slug={post.slug}
						title={post.title}
						excerpt={post.excerpt}
						coverImage={post.coverImage}
						showImage={true}
						small={true}
					/>
				{/each}
			</div>
		</div>
	{/if}
</section>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.comics-grid-section {
		padding: 2rem 1rem;
		max-width: 1200px;
		margin: 0 auto;

		.section-group {
			margin-bottom: 3rem;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.section-title {
			font-size: 1.5rem;
			margin-bottom: 1.5rem;
			text-align: center;
			font-weight: 600;
			color: var(--color--text);
		}

		.title {
			font-size: 2rem;
			margin-bottom: 1.5rem;
			text-align: center;
		}

		.grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
			gap: 1.5rem;

			@include for-phone-only {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
