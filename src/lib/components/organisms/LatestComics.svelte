<script lang="ts">
	import BlogPostCard from '$lib/components/molecules/BlogPostCard.svelte';
	import ContentSection from '$lib/components/organisms/ContentSection.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let posts: BlogPost[];
</script>

<ContentSection id="latest-comics" title="Latest Comics" align="left">
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
</ContentSection>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.grid {
		display: flex;
		flex-direction: column;
		gap: 16px;

		@include for-phone-only {
			grid-template-columns: 1fr;
		}
	}
</style>
