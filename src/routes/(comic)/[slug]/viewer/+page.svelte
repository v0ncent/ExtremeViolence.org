<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let slug = '';
	let isSeries = false;
	let chapter = '';
	let images: string[] = [];

	onMount(async () => {
		const $page = get(page);
		const post = $page.data?.post;
		slug = $page.params.slug;
		chapter = $page.url.searchParams.get('chapter') || '';
		isSeries = post?.series ?? false;

		await loadImages();
	});

	async function loadImages() {
		images = [];

		if (isSeries && !chapter) {
			console.error('Chapter is required for series');
			return;
		}

		let index = 1;
		while (true) {
			const path = isSeries
				? `/images/comics/${slug}/${chapter}/${index}.jpg`
				: `/images/comics/${slug}/${index}.jpg`;

			try {
				const res = await fetch(path, { method: 'HEAD' });
				if (!res.ok) break;
				images.push(path);
				index++;
			} catch {
				break;
			}
		}
	}
</script>

{#if images.length > 0}
	<div class="comic-viewer">
		{#each images as img}
			<img src={img} alt="Comic page" loading="lazy" />
		{/each}
	</div>
{:else}
	<p>No images found. {isSeries ? 'Make sure a valid ?chapter= is provided.' : ''}</p>
{/if}

<style>
	.comic-viewer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
	}

	img {
		max-width: 100%;
		height: auto;
		border-radius: 6px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
	}
</style>
