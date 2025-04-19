<script lang="ts">
	import BlogPostCard from '$lib/components/molecules/BlogPostCard.svelte';
	import ContentSection from '$lib/components/organisms/ContentSection.svelte';
	import type { BlogPost } from '$lib/utils/types';
	
	export let posts: BlogPost[];
</script>

<ContentSection
	id="recent-news"
	title="News"
	align="left"
>
	<div class="grid">
		{#each posts as post}
			<BlogPostCard
				slug={post.slug}
				title={post.title}
				excerpt={post.excerpt}
				tags={post.tags}
				readingTime={post.readingTime}
				showImage={false}
			/>
		{/each}
	</div>
</ContentSection>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.grid {
		width: 75%;
		display: columns;
		column-gap: 100px;
		text-align: left;

		@include for-phone-only {
			grid-template-columns: 1fr;
		}
	}
</style>
