<script lang="ts">
	import BlogPostCard from '$lib/components/molecules/BlogPostCard.svelte';
	import ContentSection from '$lib/components/organisms/ContentSection.svelte';
	import type { NewsContentModel } from '$lib/utils/types';

	export let newsposts: NewsContentModel[];
	export let sectiontitle: string;
	export let sectionid: string;
</script>

<ContentSection id={sectionid} title={sectiontitle} align="left">
	<div class="grid">
		{#each newsposts as post}
			<BlogPostCard
				slug={post.slug}
				title={post.title}
				excerpt={post.excerpt || ''}
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
