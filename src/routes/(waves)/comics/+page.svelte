<script lang="ts">
	import ComicsSection from '$lib/components/organisms/ComicsSection.svelte';
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';
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

<div class="layout-container">
	<div class="header">
		<h1>Comics</h1>
		<AdminGuard>
			<a href="/create-comic" class="create-post-button">Create Comic</a>
		</AdminGuard>
	</div>
	<ComicsSection {posts} />
</div>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.layout-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;

		h1 {
			margin: 0;
		}
	}

	.create-post-button {
		padding: 0.5rem 1rem;
		background-color: var(--color--primary);
		color: white;
		border-radius: 8px;
		font-weight: bold;
		text-decoration: none;
		transition: 0.3s;

		&:hover {
			background-color: var(--color--primary-dark);
			filter: drop-shadow(0px 0px 5px var(--color--primary));
		}
	}
</style>
