<script lang="ts">
	import BlogPostCard from '$lib/components/molecules/BlogPostCard.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let posts: BlogPost[];
</script>

<section class="comics-grid-section">
	<h2 class="title">Comics</h2>
	<div class="grid">
		{#each posts as post}
			<BlogPostCard
				slug={post.slug}
				title={post.title}
				excerpt={post.excerpt}
				coverImage={post.coverImage}
				showImage={true}
				small={true}
			/>
		{/each}
	</div>
</section>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.comics-grid-section {
		padding: 2rem 1rem;
		max-width: 1200px;
		margin: 0 auto;

		.title {
			font-size: 2rem;
			margin-bottom: 1.5rem;
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
