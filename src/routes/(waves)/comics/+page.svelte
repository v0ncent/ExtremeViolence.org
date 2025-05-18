<script lang="ts">
	import ComicsSection from '$lib/components/organisms/ComicsSection.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let data: {
		comicPosts: BlogPost[];
	};

	let posts = data.comicPosts;
</script>

<svelte:head>
	<title>Latest Comics</title>
	<meta name="description" content="Latest comics from Vincent Banks!" />
</svelte:head>

<ComicsSection {posts} />
