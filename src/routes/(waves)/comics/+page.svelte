<script lang="ts">
	import ComicsSection from '$lib/components/organisms/ComicsSection.svelte';
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';
	import type { ComicsContentModel } from '$lib/utils/types';
	import { title } from '$lib/data/meta';

	export let data: {
		comicPosts: ComicsContentModel[];
		backendError?: string;
	};

	let posts = data.comicPosts;
	let backendError = data.backendError;
</script>

<svelte:head>
	<title>Comics - {title}</title>
	<meta name="description" content="Latest comics from Vincent Banks!" />
</svelte:head>

<div class="layout-container">
	<div class="header">
		<h1>Comics</h1>
		<AdminGuard>
							<a href="/admin/create-comic" class="create-post-button">Create Comic</a>
		</AdminGuard>
	</div>

	{#if backendError}
		<div class="backend-error">
			<h2>Service Temporarily Unavailable</h2>
			<p>{backendError}</p>
			<p>Please try again later or contact an administrator.</p>
		</div>
	{:else}
		<ComicsSection {posts} />
	{/if}
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

	.backend-error {
		text-align: center;
		padding: 3rem 1rem;
		background: var(--color--background-alt);
		border-radius: 8px;
		border: 1px solid var(--color--border);

		h2 {
			color: var(--color--error);
			margin-bottom: 1rem;
		}

		p {
			color: var(--color--text-muted);
			margin-bottom: 0.5rem;
		}
	}
</style>
