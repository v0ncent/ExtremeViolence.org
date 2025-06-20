<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';

	import type { BlogPost } from '$lib/utils/types';
	import Image from '$lib/components/atoms/Image.svelte';

	import { onMount } from 'svelte';

	export let data: { post?: BlogPost } = {}; // safer fallback
	let post: BlogPost | undefined;
	let chapters: string[] = [];
	let isDeleting = false;
	let deleteError = '';

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

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this comic?')) {
			return;
		}

		isDeleting = true;
		deleteError = '';

		try {
			const response = await fetch('/api/delete-comic', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ slug: post?.slug })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to delete comic');
			}

			// Redirect to comics section after successful deletion
			goto('/comics');
		} catch (error: any) {
			deleteError = error.message;
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="article-layout">
	<Header showBackground />

	<WebsiteTabs />

	<main>
		<article id="article-content">
			{#if post}
				<div class="header">
					<h1>{post.title}</h1>
					<p>by Vincent Banks</p>
					<div class="action-buttons">
						<a href="/edit-comic/{post.slug}" class="edit-button">Edit Comic</a>
						<button class="delete-button" on:click={handleDelete} disabled={isDeleting}>
							{isDeleting ? 'Deleting...' : 'Delete Comic'}
						</button>
					</div>
					{#if deleteError}
						<p class="error">{deleteError}</p>
					{/if}
				</div>

				{#if post.series}
					<!-- Series: Render Chapter List -->
					<section class="series-coverimage hover-container">
						<Image
							src={`/images/comics/${post.slug}/SeriesCover.jpg`}
							alt={`Cover of ${post.title}`}
						/>
					</section>

					{#if post.description}
						<div class="comic-description">
							<p>{post.description}</p>
						</div>
					{/if}

					{#if chapters.length > 0}
						<section class="chapter-links">
							<h2>Chapters</h2>
							<ul>
								{#each chapters as chapter}
									<li>
										<a href={`/${post.slug}/viewer/${chapter}`} class="cover-image hover-container">
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
				{:else if post.coverImage}
					<!-- Non-Series: Render Single Cover Image -->
					<a href={`/${post.slug}/viewer`} class="cover-image hover-container">
						<Image src={post.coverImage} alt={post.title} />
						<div class="hover-text">Click to read!</div>
					</a>

					{#if post.description}
						<div class="comic-description">
							<p>{post.description}</p>
						</div>
					{/if}
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

	.header {
		text-align: center;
		margin-bottom: 2rem;

		h1 {
			margin-bottom: 0.5rem;
		}

		p {
			margin-bottom: 1rem;
			color: var(--color--text-muted);
		}

		.action-buttons {
			display: flex;
			gap: 1rem;
			justify-content: center;
			margin-bottom: 1rem;
		}

		.edit-button {
			padding: 0.5rem 1rem;
			background-color: var(--color--primary);
			color: white;
			border-radius: 8px;
			font-weight: bold;
			text-decoration: none;
			transition: 0.3s;

			&:hover {
				background-color: var(--color--primary-dark);
				filter: drop-shadow(0px 0px 5px var(--color--primary));
			}
		}

		.delete-button {
			padding: 0.5rem 1rem;
			background-color: var(--color--error);
			color: white;
			border: none;
			border-radius: 8px;
			font-weight: bold;
			cursor: pointer;
			transition: 0.3s;

			&:hover:not(:disabled) {
				background-color: #d32f2f;
				filter: drop-shadow(0px 0px 5px var(--color--error));
			}

			&:disabled {
				opacity: 0.7;
				cursor: not-allowed;
			}
		}

		.error {
			color: var(--color--error);
			margin: 0;
		}
	}

	.series-coverimage {
		max-width: 500px;
		margin: 0 auto 2rem auto;
		width: 100%;
		box-shadow: var(--image-shadow);
		border-radius: 6px;
		overflow: hidden;
		text-align: center;
	}

	.comic-description {
		max-width: 65ch;
		margin: 2rem auto;
		padding: 1.5rem;
		background: var(--color--callout-background);
		border-radius: 8px;
		border-left: 4px solid var(--color--accent);
		box-shadow: var(--shadow--small);
	}

	.comic-description p {
		margin: 0;
		line-height: 1.6;
		color: var(--color--text);
		font-size: 1.1rem;
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
		text-align: center;
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
			max-width: 500px;
			width: 100%;
			box-shadow: var(--image-shadow);
			border-radius: 6px;
			overflow: hidden;
			position: relative;
			text-align: center;
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