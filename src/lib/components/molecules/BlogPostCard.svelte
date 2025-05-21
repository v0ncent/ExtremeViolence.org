<script lang="ts">
	import Card from '$lib/components/atoms/Card.svelte';
	import Image from '../atoms/Image.svelte';

	export let title: string;
	export let coverImage: string | undefined = undefined;
	export let excerpt: string;
	export let slug: string;
	export let readingTime: string | undefined = undefined;

	export let showImage = true;
	export let small: boolean = false;
	export let previewHtml: string | undefined = undefined;
</script>

<Card
	href="/{slug}"
	target="_self"
	withBorder={!small}
	textAlign={small ? 'center' : 'left'}
	additionalClass={`blog-post-card ${!showImage || !coverImage ? 'no-image' : ''} ${
		small ? 'small' : ''
	}`}
>
	<div class="image" slot="image">
		{#if coverImage}
			<Image src={coverImage} alt="Cover image of this blog post" />
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

	:global(.blog-post-card .image img) {
		object-fit: cover;
	}

	:global(.blog-post-card.small .image) {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 300px;
		overflow: hidden;
		background: transparent;
	}

	:global(.blog-post-card.small .image img) {
		max-height: 100%;
		max-width: 100%;
		object-fit: contain !important;
		display: block;
		margin: auto;
	}

	:global(.blog-post-card.no-image > .image) {
		display: none;
	}

	:global(.blog-post-card.small) {
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
		}

		.content {
			align-items: center;
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
