<script lang="ts">
	export let data: { slug: string };

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

	import { onMount } from 'svelte';

	onMount(async () => {
		const slug = data.slug;

		if (!slug) {
			console.error('Slug is empty or undefined');
			loading = false;
			return;
		}

		for (let i = 1; i <= MAX_PAGES; i++) {
			const imgPath = `/comics/${slug}/${i}.jpg`;
			const exists = await checkImageExists(imgPath);

			if (!exists) break;

			imageUrls.push(imgPath);
		}

		loading = false;
	});
</script>

<svelte:head>
	<title>Read Comic: {data.slug}</title>
</svelte:head>

<div class="comic-viewer">
	{#if loading}
		<p>Loading comic pages...</p>
	{:else if imageUrls.length > 0}
		{#each imageUrls as img}
			<img class="comic-page" src={img} alt="Comic page" />
		{/each}
	{:else}
		<p>No comic pages found for "{data.slug}".</p>
	{/if}
</div>
