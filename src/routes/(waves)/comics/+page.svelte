<script lang="ts">
	import LatestComics from '$lib/components/organisms/LatestComics.svelte';
	import type { BlogPost } from '$lib/utils/types';
	
	export let data: {
		comicPosts: BlogPost[];
	};

	let posts = data.comicPosts;
</script>

<svelte:head>
	<title>Latest Comics</title>
	<meta name="description" content="Check out our latest comics and graphic stories." />
</svelte:head>

<section class="comics-page">
	<LatestComics {posts} layout="grid" sectiontitle="Comics"/>
</section>

<style lang="scss">
	.comics-page {
		padding: 2rem 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
