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
	additionalClass="blog-post-card {!showImage || !coverImage ? 'no-image' : ''} {small
		? 'small'
		: ''}"
>
	<div class="image" slot="image">
		{#if coverImage}
			<Image src={coverImage} alt="Cover image of this blog post" />
		{/if}
	</div>
	<div class="content" slot="content">
		<p class="title">
			{title}
		</p>
		{#if readingTime}
			<div class="note">{readingTime}</div>
		{/if}
		{#if excerpt}
			<p class="text">
				{excerpt}
			</p>
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

	.tags {
		display: flex;
		align-items: center;
		gap: 5px;
		flex-wrap: wrap;
	}

	.note {
		font-size: 0.8rem;
		color: rgba(var(--color--text-rgb), 0.8);
	}

	.text {
		margin-top: 5px;
		font-size: 1rem;
		text-align: justify;
		font-weight: bold;
	}

	.preview {
		margin-top: 20px;
	}

	.footer {
		margin-top: 20px;
	}

	:global(.blog-post-card .image img) {
		object-fit: cover;
	}

	:global(.blog-post-card.no-image > .image) {
		display: none;
	}

	:global(.blog-post-card.small) {
		padding: 8px;
		font-size: 0.8rem;

		.image img {
			height: 120px; // smaller image if needed
		}

		.title {
			font-size: 1rem;
		}

		.text {
			font-size: 0.8rem;
		}
	}
</style>
