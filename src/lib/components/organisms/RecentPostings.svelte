<script lang="ts">
	import BlogPostCard from '$lib/components/molecules/BlogPostCard.svelte';
	import ContentSection from '$lib/components/organisms/ContentSection.svelte';
	import type { BlogPost } from '$lib/utils/types';
	
	export let galleryandcomicposts: BlogPost[];
</script>

<ContentSection
	id="recent-posts"
	title="Recent Postings"
	align="left"
>
	<div class="grid">
		{#each galleryandcomicposts as post}
			<BlogPostCard
				slug={post.slug}
				title={post.title}
				excerpt={post.excerpt}
				coverImage={post.coverImage}
				showImage={true}
			/>
		{/each}
	</div>
</ContentSection>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.grid {
		width: 75%;
		display: grid;
		column-gap: 100px;
		text-align: left;
		gap: 32px 24px;

		@include for-phone-only {
			grid-template-columns: 1fr;
		}
	}
</style>
