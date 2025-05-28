<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import type { BlogPost } from '$lib/utils/types';
	import Image from '$lib/components/atoms/Image.svelte';
	import { onMount } from 'svelte';

	export let data: { post?: BlogPost };
	let post: BlogPost | undefined;
	let chapters: string[] = [];

	$: post = data?.post;

	onMount(async () => {
		if (post?.series) {
			try {
				const res = await fetch(`/images/comics/${post.slug}/`);
				const text = await res.text();
				const matches = [...text.matchAll(/href="(chapter[^"]+)\//g)];
				chapters = matches.map((m) => m[1]);
			} catch (err) {
				console.error('Error loading chapters:', err);
			}
		}
	});
</script>

<div class="article-layout">
	<Header showBackground />

	<WebsiteTabs />

	<main>
		<article id="article-content">
			{#if post?.coverImage}
				{#if post.series}
					<h2>Chapters</h2>
					<ul>
						{#each chapters as chapter}
							<li>
								<a
									href={`/${post.slug}/viewer?chapter=${chapter}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{chapter.replace(/chapter/i, 'Chapter ')}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<a
						href={`/${post.slug}/viewer`}
						class="cover-image"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image src={post.coverImage} alt={post.title} />
					</a>
				{/if}
			{/if}
			<div class="content">
				<slot />
			</div>
		</article>
	</main>

	<Footer />
</div>

<style lang="scss">
	@import '$lib/scss/_mixins.scss';

	.article-layout {
		--body-background-color: var(--color--post-page-background);
		background-color: var(--color--post-page-background);
	}

	#article-content {
		--main-column-width: 65ch;
		position: relative;
		padding-top: 40px;
		padding-bottom: 80px;
		padding-right: 15px;
		padding-left: 15px;

		@include for-iphone-se {
			padding-left: 0;
			padding-right: 0;
		}

		@include for-tablet-portrait-up {
			padding-right: 20px;
			padding-left: 20px;
		}

		@include for-tablet-landscape-up {
			padding-right: 30px;
			padding-left: 30px;
		}

		display: flex;
		flex-direction: column;
		gap: 30px;

		.header {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			gap: 10px;
			width: min(var(--main-column-width), 100%);
			margin: 0 auto;

			.note {
				font-size: 90%;
				color: rgba(var(--color--text-rgb), 0.8);
			}
		}

		.cover-image {
			margin: 0 auto;
			max-width: 800px;
			width: 100%;
			box-shadow: var(--image-shadow);
			border-radius: 6px;
			overflow: hidden;

			img {
				width: 100%;
				height: auto;
				display: block;
				object-fit: cover;
			}
		}

		:global(.cover-image img) {
			max-height: flex;
			object-fit: cover;
		}

		.content {
			display: grid;
			grid-template-columns:
				1fr
				min(var(--main-column-width), 100%)
				1fr;

			:global(> *) {
				grid-column: 2;
			}

			:global(> .full-bleed) {
				grid-column: 1 / 4;
				width: 100%;
				max-width: 1600px;
				margin-left: auto;
				margin-right: auto;
			}
		}

		.tags {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 5px;
			flex-wrap: wrap;
		}
	}
</style>
