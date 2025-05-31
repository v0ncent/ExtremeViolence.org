<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';

	import type { BlogPost } from '$lib/utils/types';
	import Image from '$lib/components/atoms/Image.svelte';

	import { onMount } from 'svelte';

	export let data: { post?: BlogPost } = {}; // safer fallback
	let post: BlogPost | undefined;
	let chapters: string[] = [];

	$: post = data?.post;

	onMount(async () => {
		if (post?.series) {
			const res = await fetch(`/api/chapters/${post.slug}`);
			if (res.ok) {
				const data = await res.json();
				chapters = data.chapters;
			}
		}
	});
</script>


<div class="article-layout">
	<Header showBackground />

	<WebsiteTabs />

	<main>
		<article id="article-content">
			{#if post && post.series}
				<!-- Series: Render Chapter List -->
				{#if chapters.length > 0}
					<section class="chapter-links">
						<section class="series-coverimage hover-container">
							<Image
								src={`/images/comics/${post.slug}/SeriesCover.jpg`}
								alt={`Cover of ${post.title}`}
							/>
						</section>

						<h2>Chapters</h2>
						<ul>
							{#each chapters as chapter}
								<li>
									<a
										href={`/${post.slug}/viewer/${chapter}`}
										class="cover-image hover-container"
										target="_blank"
										rel="noopener noreferrer"
									>
										<Image
											src={`/images/comics/${post.slug}/${chapter}/1.jpg`}
											alt={`Cover of ${post.title} - Chapter ${chapter}`}
										/>
										<div class="hover-text">Click to read!</div>
										<span>{chapter}</span>
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{:else}
					<p>Loading chapters...</p>
				{/if}
			{:else if post && post.coverImage}
				<!-- Non-Series: Render Single Cover Image -->
				<a
					href={`/${post.slug}/viewer`}
					class="cover-image hover-container"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image src={post.coverImage} alt={post.title} />
					<div class="hover-text">Click to read!</div>
				</a>
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

	.series-coverimage {
		max-width: 800px;
		margin: 0 auto 2rem auto; // added bottom space
		width: 100%;
		box-shadow: var(--image-shadow);
		border-radius: 6px;
		overflow: hidden;
	}

	.chapter-links h2 {
		text-align: center;
		margin: 2rem 0 1rem;
		font-size: 2rem;
	}

	.chapter-links ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
		padding: 0;
		list-style: none;
	}

	.chapter-links li {
		width: 180px;
		text-align: center;
	}

	.chapter-links .cover-image {
		display: block;
		box-shadow: var(--image-shadow);
		border-radius: 6px;
		overflow: hidden;
		position: relative;
	}

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

		.cover-image {
			margin: 0 auto;
			max-width: 800px;
			width: 100%;
			box-shadow: var(--image-shadow);
			border-radius: 6px;
			overflow: hidden;
			position: relative;
		}

		:global(.cover-image img) {
			width: 100%;
			height: auto;
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
	}

	/* Hover effect */
	.hover-container {
		position: relative;
		cursor: pointer;
	}

	.hover-text {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		font-size: 1.2rem;
		text-align: center;
		padding: 0.5rem;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}

	.hover-container:hover .hover-text {
		opacity: 1;
	}
</style>
