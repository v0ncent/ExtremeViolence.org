<script lang="ts">
	import type { ComicsContentModel } from '$lib/utils/types';
	import { goto } from '$app/navigation';
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';
	import Image from '$lib/components/atoms/Image.svelte';
	import Comments from '$lib/components/molecules/Comments.svelte';
	import { onMount } from 'svelte';
	import { title as siteTitle } from '$lib/data/meta';

	export let data: { post?: ComicsContentModel } = {};

	$: post = data?.post;
	let chapters: string[] = [];
	let isDeleting = false;
	let deleteError = '';
	let chaptersLoaded = false;

	onMount(async () => {
		if (post?.series) {
			const res = await fetch(`/api/chapters/${post.slug}`);
			if (res.ok) {
				const data = await res.json();
				chapters = data.chapters;
			}
			chaptersLoaded = true;
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

<svelte:head>
	<title>{post?.title || 'Comic Details'} - {siteTitle}</title>
	<meta name="description" content={post?.description || 'Comic details page'} />
</svelte:head>

{#if post}
	<div class="header">
		<AdminGuard>
			<div class="action-buttons">
				<a href="/admin/edit-comic/{post.slug}" class="edit-button button">Edit Comic</a>
				<button class="delete-button" on:click={handleDelete} disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete Comic'}
				</button>
			</div>
			{#if deleteError}
				<p class="error">{deleteError}</p>
			{/if}
		</AdminGuard>
	</div>

	{#if post.series}
		<!-- Series: Render Chapter List -->
		<section class="series-coverimage">
			<Image src={`/images/comics/${post.slug}/SeriesCover.jpg`} alt={`Cover of ${post.title}`} />
		</section>
		<h1 class="comic-title">{post.title}</h1>
		<p class="byline">by Vincent Banks</p>

		{#if chaptersLoaded}
			{#if chapters.length > 0}
				<section class="chapter-links">
					<h2>Read Chapters</h2>
					<p class="chapters-intro">Click on any chapter below to start reading:</p>
					<ul>
						{#each chapters as chapter}
							<li>
								<a
									href={`/comic/${post.slug}/viewer/${chapter}`}
									target="_blank"
									rel="noopener noreferrer"
									class="chapter-cover hover-container"
								>
									<Image
										src={`/images/comics/${post.slug}/${chapter}/1.jpg`}
										alt={`Cover of ${post.title} - Chapter ${chapter.replace('chapter', '')}`}
									/>
									<div class="hover-text">
										Click to read Chapter {chapter.replace('chapter', '')}!
									</div>
									<span class="chapter-number">Chapter {chapter.replace('chapter', '')}</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{:else}
				<div class="chapters-status">
					<p>No chapters yet.</p>
				</div>
			{/if}
		{:else}
			<div class="chapters-status">
				<p>Loading chapters...</p>
			</div>
		{/if}
	{:else if post.coverImage}
		<!-- Non-Series: Render Single Cover Image -->
		<a
			href={`/comic/${post.slug}/viewer`}
			target="_blank"
			rel="noopener noreferrer"
			class="comic-cover hover-container"
		>
			<Image src={post.coverImage} alt={post.title} />
			<div class="hover-text">Click to read in new tab!</div>
		</a>
		<h1 class="comic-title">{post.title}</h1>
		<p class="byline">by Vincent Banks</p>
	{/if}

	<div class="comic-info">
		{#if post.description}
			<div class="description">
				<h2>Description</h2>
				<p>{post.description}</p>
			</div>
		{/if}

		<div class="comic-meta">
			<div class="meta-item">
				<strong>Type:</strong>
				{post.series ? 'Series' : 'One-shot'}
			</div>
			<div class="meta-item">
				<strong>Published:</strong>
				{new Date(post.date).toLocaleDateString()}
			</div>
		</div>
	</div>

	<!-- Comments Section -->
	<Comments postSlug={post.slug} postId={post.id} service="news" />
{:else}
	<div class="error">
		<h2>Comic Not Found</h2>
		<p>The comic you're looking for doesn't exist or has been removed.</p>
		<a href="/comics" class="back-link">← Back to Comics</a>
	</div>
{/if}

<style lang="scss">
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
				filter: none !important;
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

	.series-coverimage,
	.comic-cover {
		max-width: 1000px;
		max-height: 1000px;
		width: 100%;
		height: auto;
		margin: 0 auto 2rem auto;
		box-shadow: var(--image-shadow);
		border-radius: 6px;
		overflow: hidden;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chapter-links h2 {
		text-align: center;
		margin: 2rem 0 1rem;
		font-size: 2rem;
		color: var(--color--text);
	}

	.chapters-intro {
		text-align: center;
		margin-bottom: 2rem;
		color: var(--color--text-muted);
		font-size: 1.1rem;
	}

	.chapters-status {
		text-align: center;
		margin: 2rem 0;
		padding: 2rem;
		color: var(--color--text-muted);
		font-size: 1.1rem;
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
		width: 250px;
		text-align: center;
	}

	.chapter-cover {
		display: block;
		box-shadow: var(--image-shadow);
		border-radius: 6px;
		overflow: hidden;
		position: relative;
		text-align: center;
		width: 250px;
		height: 333px;
		margin: 0 auto;
		transition: transform 0.2s ease, box-shadow 0.2s ease;

		&:hover {
			transform: translateY(-5px);
			box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
		}
	}

	.chapter-number {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.5rem;
		text-align: center;
		font-weight: bold;
		font-size: 0.9rem;
	}

	:global(.comic-cover img),
	:global(.series-coverimage img) {
		width: 100%;
		height: auto;
		display: block;
		object-fit: contain;
		max-width: 1000px;
		max-height: 1000px;
		margin: 0 auto;
	}

	:global(.chapter-cover img) {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		max-width: 250px;
		max-height: 333px;
	}

	.comic-info {
		max-width: 65ch;
		margin: 2rem auto 0;
		padding: 2rem 0;
	}

	.description {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--color--callout-background);
		border-radius: 8px;
		border-left: 4px solid var(--color--accent);
		box-shadow: var(--shadow--small);

		h2 {
			margin: 0 0 1rem 0;
			color: var(--color--text);
			font-size: 1.5rem;
		}

		p {
			margin: 0;
			line-height: 1.6;
			color: var(--color--text);
			font-size: 1.1rem;
		}
	}

	.comic-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--color--background-alt);
		border-radius: 8px;
		border: 1px solid var(--color--border);

		.meta-item {
			font-size: 1rem;
			color: var(--color--text);

			strong {
				color: var(--color--text);
				margin-right: 0.5rem;
			}
		}
	}

	.error {
		text-align: center;
		padding: 3rem 1rem;

		h2 {
			color: var(--color--error);
			margin-bottom: 1rem;
		}

		p {
			color: var(--color--text-muted);
			margin-bottom: 2rem;
		}

		.back-link {
			display: inline-block;
			padding: 0.5rem 1rem;
			background-color: var(--color--primary);
			color: white;
			text-decoration: none;
			border-radius: 8px;
			font-weight: bold;
			transition: 0.3s;

			&:hover {
				background-color: var(--color--primary-dark);
				filter: drop-shadow(0px 0px 5px var(--color--primary));
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
		font-size: 1rem;
		text-align: center;
		padding: 0.5rem;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
		z-index: 2;
	}

	.hover-container:hover .hover-text {
		opacity: 1;
	}

	.comic-title {
		text-align: center;
		margin: 1rem 0 0.25rem 0;
		font-size: 2rem;
		font-family: var(--font--title, inherit);
		font-weight: bold;
	}
	.byline {
		text-align: center;
		margin: 0 0 2rem 0;
		color: var(--color--text-muted);
		font-size: 1.1rem;
	}
</style>
