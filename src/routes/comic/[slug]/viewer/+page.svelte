<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let imagePathPrefix = '';
	let title = '';
	let images: string[] = [];
	let currentIndex = 0;

	const MAX_PAGES = 50;

	async function imageExists(url: string) {
		try {
			const res = await fetch(url);
			return res.ok && res.headers.get('Content-Type')?.startsWith('image/');
		} catch {
			return false;
		}
	}

	async function preloadImages(base: string) {
		const tempImages: string[] = [];

		for (let i = 1; i <= MAX_PAGES; i++) {
			const imagePath = `${base}/${i}.jpg`;

			const exists = await imageExists(imagePath);

			if (exists) {
				tempImages.push(imagePath);
			} else {
				break;
			}
		}

		images = tempImages;
		currentIndex = 0;
	}

	function prevPage() {
		if (currentIndex > 0) currentIndex--;
	}

	function nextPage() {
		if (currentIndex < images.length - 1) currentIndex++;
	}

	onMount(async () => {
		const { params } = get(page);
		const slug = params.slug;
		const url = get(page).url;
		const chapter = url.searchParams.get('chapter');

		if (chapter) {
			// Series comic: /comic/{slug}/viewer?chapter={chapter}
			title = `${slug} - ${chapter}`;
			imagePathPrefix = `/images/comics/${slug}/${chapter}`;
		} else {
			// One-shot comic: /comic/{slug}/viewer
			title = slug;
			imagePathPrefix = `/images/comics/${slug}`;
		}

		await preloadImages(imagePathPrefix);
	});
</script>

<svelte:head>
	<title>{title} - Comic Viewer - Extreme Violence</title>
</svelte:head>

<div class="comic-reader">
	{#if images.length > 0}
		<img src={images[currentIndex]} alt={`Comic Page ${currentIndex + 1}`} class="comic-page" />
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
		justify-content: space-between;
		padding: 2rem 1rem;
		background: #000;
		min-height: 100vh;
	}

	.comic-page {
		width: 100%;
		max-width: 100%;
		max-height: 85vh;
		height: auto;
		object-fit: contain;
		background: #111;
		border-radius: 6px;
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
		margin: 0;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: auto;
		padding: 1rem 0;
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
