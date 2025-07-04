<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import dateformat from 'dateformat';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';

	import { keywords, siteBaseUrl, title } from '$lib/data/meta';
	import type { BlogPost } from '$lib/utils/types';
	import Image from '$lib/components/atoms/Image.svelte';

	export let data: { post: BlogPost };
	$: ({ post } = data);

	let metaKeywords = keywords;
	let isDeleting = false;
	let isEditing = false;

	async function handleDelete() {
		if (!post || !confirm('Are you sure you want to delete this post?')) {
			return;
		}

		isDeleting = true;
		try {
			const response = await fetch('/api/delete-post', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ slug: post.slug })
			});

			const result = await response.json();

			if (result.success) {
				goto('/news'); // Redirect to news section instead of home page
			} else {
				alert('Failed to delete post: ' + result.error);
			}
		} catch (error) {
			console.error('Error deleting post:', error);
			alert('Failed to delete post');
		} finally {
			isDeleting = false;
		}
	}

	async function handleEdit() {
		if (!post) return;
		goto(`/edit-post/${post.slug}`);
	}
</script>

<svelte:head>
	{#if post}
		<meta name="keywords" content={metaKeywords.join(', ')} />

		<meta name="description" content={post.excerpt} />
		<meta property="og:description" content={post.excerpt} />
		<meta name="twitter:description" content={post.excerpt} />
		<link rel="canonical" href="{siteBaseUrl}/{post.slug}" />

		<title>{post.title} - {title}</title>
		<meta property="og:title" content="{post.title} - {title}" />
		<meta name="twitter:title" content="{post.title} - {title}" />

		{#if post.coverImage}
			<meta property="og:image" content="{siteBaseUrl}{post.coverImage}" />
			<meta name="twitter:image" content="{siteBaseUrl}{post.coverImage}" />
		{/if}
	{/if}
</svelte:head>

<div class="article-layout">
	<Header showBackground />

	<WebsiteTabs />

	<main>
		<article id="article-content">
			<div class="header">
				{#if post}
					<h1>{post.title}</h1>
					<div class="note">{dateformat(post.date, 'UTC:dd mmmm yyyy')}</div>
					{#if post.updated}
						<div class="note">Last updated: {dateformat(post.updated, 'UTC:dd mmmm yyyy')}</div>
					{/if}
					<AdminGuard>
						<div class="button-group">
							<button class="edit-button" on:click={handleEdit} disabled={isEditing}>
								{isEditing ? 'Editing...' : 'Edit Post'}
							</button>
							<button class="delete-button" on:click={handleDelete} disabled={isDeleting}>
								{isDeleting ? 'Deleting...' : 'Delete Post'}
							</button>
						</div>
					</AdminGuard>
				{/if}
			</div>
			{#if post && post.coverImage}
				<div class="cover-image">
					<Image src={post.coverImage} alt={post.title} />
				</div>
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
			width: min(var(--main-column-width), 100%);
			margin: 0 auto;
			box-shadow: var(--image-shadow);
			border-radius: 6px;

			img {
				width: 100%;
				height: auto;
				object-fit: contain;
			}
		}

		:global(.cover-image img) {
			height: auto;
			object-fit: contain;
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

	.button-group {
		display: flex;
		gap: 10px;
		margin-top: 20px;
	}

	.edit-button {
		padding: 8px 16px;
		background-color: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.2s;

		&:hover:not(:disabled) {
			background-color: #218838;
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}

	.delete-button {
		margin-top: 20px;
		padding: 8px 16px;
		background-color: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.2s;

		&:hover:not(:disabled) {
			background-color: #c82333;
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}
</style>
