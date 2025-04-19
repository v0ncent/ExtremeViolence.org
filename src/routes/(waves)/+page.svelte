<script lang="ts">
	import RecentPosts from '$lib/components/organisms/RecentPosts.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let data: {
		posts: BlogPost[];
	};

	let { posts } = data;
</script>

<div class="container">
	{#if posts && posts.length > 0}
		<RecentPosts {posts} />
	{/if}
</div>
