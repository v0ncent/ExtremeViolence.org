<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let slug: string;
	let imageUrls: string[] = [];
	let loading = true;

	const MAX_PAGES = 50;

	async function checkImageExists(url: string): Promise<boolean> {
		try {
			const res = await fetch(url, { method: 'HEAD' });
			return res.ok;
		} catch {
			return false;
		}
	}

	onMount(async () => {
		slug = get(page).params.slug;

		for (let i = 1; i <= MAX_PAGES; i++) {
			const imgPath = `/${slug}/${i}.jpg`;
			const exists = await checkImageExists(imgPath);

			if (!exists) break;

			imageUrls.push(imgPath);
		}

		loading = false;
	});
</script>

<svelte:head>
	<title>Read Comic: {slug}</title>
</svelte:head>

<div class="comic-viewer">
	{#if loading}
		<p>Loading comic pages...</p>
	{:else if imageUrls.length > 0}
		{#each imageUrls as img}
			<img class="comic-page" src={img} alt="Comic page" />
		{/each}
	{:else}
		<p>No comic pages found for "{slug}".</p>
	{/if}
</div>

<style>
	.comic-viewer {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		gap: 2rem;
	}

	.comic-page {
		max-width: 100%;
		height: auto;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}
</style>
