<script lang="ts">
	import ComicCard from '$lib/components/molecules/ComicCard.svelte';
	import ContentSection from '$lib/components/organisms/ContentSection.svelte';
	import type { ComicsContentModel } from '$lib/utils/types';

	export let posts: ComicsContentModel[];
	export let layout: 'stacked' | 'grid' = 'stacked'; // default is stacked
	export let sectiontitle: string;
</script>

<ContentSection id="latest-comics" title={sectiontitle}>
	<div class="grid {layout}">
		{#each posts as post}
			<ComicCard
				slug={post.slug}
				title={post.title}
				excerpt={''}
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
		&.stacked {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}

		&.grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
			gap: 1.5rem;

			@include for-phone-only {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
