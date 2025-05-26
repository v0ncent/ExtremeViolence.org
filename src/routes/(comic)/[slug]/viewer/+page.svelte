<script lang="ts">
	export let data: {
		slug: string;
		title: string;
		coverImage: string;
	};

	import { onMount } from 'svelte';

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
		for (let i = 1; i <= MAX_PAGES; i++) {
			const imgPath = `/comics/${data.slug}/${i}.jpg`;
			if (!(await checkImageExists(imgPath))) break;
			imageUrls.push(imgPath);
		}
		loading = false;
	});
</script>

<svelte:head>
	<title>{data.title}</title>
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
