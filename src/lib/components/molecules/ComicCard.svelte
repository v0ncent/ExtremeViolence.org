<script lang="ts">
	import Card from '$lib/components/atoms/Card.svelte';
	import Image from '../atoms/Image.svelte';
	import { onMount } from 'svelte';

	export let title: string;
	export let coverImage: string | undefined = undefined;
	export let excerpt: string;
	export let slug: string;
	export let readingTime: string | undefined = undefined;

	export let showImage = true;
	export let small: boolean = false;
	export let previewHtml: string | undefined = undefined;

	// Add a key to force re-render when the preview HTML changes
	let key = 0;

	onMount(() => {
		// Increment the key when the component mounts to ensure fresh content
		key = Date.now();
	});
</script>

<Card
	href="/comic-details/{slug}"
	target="_self"
	withBorder={!small}
	textAlign={small ? 'center' : 'left'}
	additionalClass={`comic-card ${!showImage || !coverImage ? 'no-image' : ''} ${
		small ? 'small' : ''
	}`}
>
	<div class="image" slot="image">
		{#if coverImage}
			<Image src={coverImage} alt="Cover image of this comic" />
		{/if}
	</div>
	<div class="content" slot="content">
		<p class="title">{title}</p>
		{#if readingTime}
			<div class="note">{readingTime}</div>
		{/if}
		{#if excerpt}
			<p class="text">{excerpt}</p>
		{/if}
		{#if previewHtml}
			<div class="preview">{@html previewHtml}</div>
		{/if}
	</div>
</Card>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		gap: 0px;
		align-items: flex-start;
	}

	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-size: 1.2rem;
		font-family: var(--font--title);
		font-weight: 700;
	}

	.note {
		font-size: 0.8rem;
		color: rgba(var(--color--text-rgb), 0.8);
	}

	.text {
		margin-top: 5px;
		font-size: 1rem;
		text-align: center;
		font-weight: bold;
	}

	.preview {
		margin-top: 25px;
		word-spacing: 5px;
	}

	.footer {
		margin-top: 20px;
	}

	:global(.comic-card .image img) {
		object-fit: cover;
	}

	:global(.comic-card.small .image) {
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		width: 100% !important;
		height: 300px !important;
		overflow: hidden;
		background: transparent;
		position: relative !important;
		flex: none !important;
		min-height: auto !important;
		max-height: none !important;
	}

	:global(.comic-card.small .image img) {
		max-height: 100%;
		max-width: 100%;
		object-fit: contain !important;
		display: block;
		margin: 0 auto;
		position: static !important;
		width: auto !important;
		height: auto !important;
		left: auto !important;
		right: auto !important;
		top: auto !important;
		bottom: auto !important;
	}

	:global(.comic-card.no-image > .image) {
		display: none;
	}

	:global(.comic-card.small) {
		font-size: 0.8rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;

		.image {
			height: 300px;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			flex: none !important;
		}

		.content {
			align-items: center;
			width: 100%;
		}

		.title {
			font-size: 1rem;
			justify-content: center;
		}

		.text {
			font-size: 0.8rem;
		}
	}

	:global(.preview .read-more) {
		color: red;
		font-weight: 500;
		cursor: pointer;
	}

	:global(.preview .read-more:hover) {
		text-decoration: underline;
	}
</style>
