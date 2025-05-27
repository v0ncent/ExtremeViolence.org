<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let slug: string = '';
	let images: string[] = [];

	const MAX_PAGES = 50;

	async function preloadImages(slug: string) {
		for (let i = 1; i <= MAX_PAGES; i++) {
			const imagePath = `/images/comics/${slug}/${i}.jpg`;

			const exists = await imageExists(imagePath);

			if (exists) {
				images.push(imagePath);
			} else {
				break; // stop loading further images once a page is missing
			}
		}
	}

	async function imageExists(url: string): Promise<boolean> {
		try {
			const res = await fetch(url, { method: 'HEAD' });
			return res.ok;
		} catch (e) {
			return false;
		}
	}

	onMount(async () => {
		const { params } = get(page);
		slug = params.slug;
		await preloadImages(slug);
	});
</script>


<svelte:head>
	<title>{slug} - Comic Viewer</title>
</svelte:head>

<div class="comic-viewer">
	{#each images as image}
		<img
			src={image}
			alt="Comic Page"
			loading="lazy"
			on:error={() => {
				images = images.slice(0, images.indexOf(image));
			}}
		/>
	{/each}
</div>

<style>
	:global(body) {
		margin: 0;
		background-color: #000;
		color: white;
		font-family: system-ui, sans-serif;
	}

	.comic-viewer {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: white;
		padding: 2rem 1rem;
	}

	img {
		width: 100%;
		max-width: 960px;
		height: auto;
		margin-bottom: 2rem;
		background: #111;
		border-radius: 6px;
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
	}
</style>
