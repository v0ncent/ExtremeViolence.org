
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let slug = '';
	let images: string[] = [];
	let currentIndex = 0;

	const MAX_PAGES = 50;

	async function imageExists(url: string) {
		try {
			const res = await fetch(url, { method: 'HEAD' });
			return res.ok;
		} catch {
			return false;
		}
	}

	async function preloadImages(slug: string) {
		const tempImages: string[] = [];

		for (let i = 1; i <= MAX_PAGES; i++) {
			const imagePath = `/images/comics/${slug}/${i}.jpg`;
			const exists = await imageExists(imagePath);

			if (exists) {
				tempImages.push(imagePath);
			} else {
				break;
			}
		}

		images = tempImages;
		currentIndex = 0; // reset to first page
	}

	function prevPage() {
		if (currentIndex > 0) currentIndex--;
	}

	function nextPage() {
		if (currentIndex < images.length - 1) currentIndex++;
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

<div class="comic-reader">
	{#if images.length > 0}
		<img
			src={images[currentIndex]}
			alt={`Comic Page ${currentIndex + 1}`}
			class="comic-page"
		/>
		<div class="controls">
			<button on:click={prevPage} disabled={currentIndex === 0}>⬅ Prev</button>
			<span>Page {currentIndex + 1} of {images.length}</span>
			<button on:click={nextPage} disabled={currentIndex === images.length - 1}>Next ➡</button>
		</div>
	{:else}
		<p>Loading comic pages...</p>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		background-color: #000;
		color: white;
		font-family: system-ui, sans-serif;
	}

	.comic-reader {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		background: #000;
		min-height: 100vh;
	}

	.comic-page {
		width: 100%;
		max-width: 960px;
		height: auto;
		background: #111;
		border-radius: 6px;
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
		margin-bottom: 2rem;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	button {
		background: white;
		color: black;
		border: none;
		padding: 0.6rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		transition: background 0.2s;
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
