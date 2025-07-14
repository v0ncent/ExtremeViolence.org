<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import dateformat from 'dateformat';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';
	import Comments from '$lib/components/molecules/Comments.svelte';

	import { keywords, siteBaseUrl, title } from '$lib/data/meta';
	import type { GalleryContentModel } from '$lib/utils/types';
	import Image from '$lib/components/atoms/Image.svelte';

	export let data: { post: GalleryContentModel };
	$: ({ post } = data);

	let metaKeywords = keywords;
	let isDeleting = false;
	let deleteError = '';

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this gallery post?')) {
			return;
		}

		isDeleting = true;
		deleteError = '';

		try {
			const response = await fetch('/api/delete-gallery-post', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ slug: post.slug })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to delete post');
			}

			// Redirect to gallery section after successful deletion
			goto('/gallery-section');
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
				{#if post.coverImage}
					<div class="cover-image">
						<Image src={post.coverImage} alt={post.title} />
					</div>
				{/if}

				<div class="header">
					<h1>{post.title}</h1>
					<p>by Vincent Banks</p>
					<AdminGuard>
						<div class="action-buttons">
							<a href="/edit-gallery-post/{post.slug}" class="edit-button">Edit Post</a>
							<button class="delete-button" on:click={handleDelete} disabled={isDeleting}>
								{isDeleting ? 'Deleting...' : 'Delete Post'}
							</button>
						</div>
						{#if deleteError}
							<p class="error">{deleteError}</p>
						{/if}
					</AdminGuard>
				</div>
			{:else}
				<div class="not-found">
					<h2>Gallery post not found</h2>
					<p>The requested gallery post could not be found.</p>
					<a href="/gallery-section" class="back-link">Back to Gallery</a>
				</div>
			{/if}
			<div class="content">
				<slot />
			</div>

			{#if post}
				<Comments postSlug={post.slug} postId={post.id} service="gallery" />
			{/if}
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

			.delete-button {
				margin-top: 10px;
				padding: 8px 16px;
				background-color: #dc3545;
				color: white;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-weight: bold;
				transition: background-color 0.2s;

				&:hover:not(:disabled) {
					background-color: #c82333;
				}

				&:disabled {
					opacity: 0.7;
					cursor: not-allowed;
				}
			}

			.error {
				color: #dc3545;
				margin-top: 8px;
				font-size: 0.9em;
			}

			.action-buttons {
				display: flex;
				gap: 10px;
				margin-top: 10px;

				.edit-button {
					padding: 8px 16px;
					background-color: #007bff;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
					font-weight: bold;
					text-decoration: none;
					transition: background-color 0.2s;

					&:hover {
						background-color: #0056b3;
					}
				}

				.delete-button {
					padding: 8px 16px;
					background-color: #dc3545;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
					font-weight: bold;
					transition: background-color 0.2s;

					&:hover:not(:disabled) {
						background-color: #c82333;
					}

					&:disabled {
						opacity: 0.7;
						cursor: not-allowed;
					}
				}
			}
		}

		.cover-image {
			width: flex;
			margin: 0 auto;
			max-height: flex;
			box-shadow: var(--image-shadow);
			border-radius: 6px;

			img {
				width: flex;
				height: flex;
				max-height: flex;
			}
		}

		:global(.cover-image img) {
			max-height: flex;
			object-fit: cover;
		}

		.not-found {
			text-align: center;
			padding: 3rem 1rem;
			width: min(var(--main-column-width), 100%);
			margin: 0 auto;

			h2 {
				color: var(--color--text);
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
				border-radius: 4px;
				transition: background-color 0.2s;

				&:hover {
					background-color: var(--color--primary-dark);
				}
			}
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
