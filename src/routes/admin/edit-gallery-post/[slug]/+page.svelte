<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';
	import Image from '$lib/components/atoms/Image.svelte';
	import type { GalleryContentModel } from '$lib/utils/types';
	import { title as siteTitle } from '$lib/data/meta';

	export let data: { post: GalleryContentModel };

	let title = data.post.title;
	let coverImage = data.post.coverImage;
	// Convert ISO date string to datetime-local format (YYYY-MM-DDTHH:MM)
	let date = data.post.date ? new Date(data.post.date).toISOString().slice(0, 16) : '';
	let error = '';
	let loading = false;
	let showPreview = false;

	// Function to normalize image path for database storage
	function normalizeImagePath(imagePath: string): string {
		if (!imagePath.trim()) return '';

		// If it already starts with /images/gallery/, return as is
		if (imagePath.startsWith('/images/gallery/')) {
			return imagePath;
		}

		// If it starts with /, assume it's a full path but not in gallery directory
		if (imagePath.startsWith('/')) {
			return `/images/gallery${imagePath}`;
		}

		// Otherwise, assume it's just a filename and add the gallery path
		return `/images/gallery/${imagePath}`;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			// Normalize the image path for database storage
			const normalizedImagePath = normalizeImagePath(coverImage);

			// Convert date to ISO format for database storage
			const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();

			const formData = new FormData();
			formData.append('slug', data.post.slug);
			formData.append('title', title);
			formData.append('coverImage', normalizedImagePath);
			formData.append('date', isoDate);

			const response = await fetch('/api/edit-gallery-post', {
				method: 'PUT',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to edit post');
			}

			// Redirect to gallery section after successful edit
			goto('/gallery-section');
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Edit {data.post.title} - {siteTitle}</title>
	<meta name="description" content="Edit gallery post: {data.post.title}" />
</svelte:head>

<div class="article-layout">
	<Header showBackground />
	<WebsiteTabs />

	<main>
		<article id="article-content">
			<div class="header">
				<h1>Edit Gallery Post</h1>
			</div>
			<div class="content">
				<div class="editor-container">
					<form on:submit={handleSubmit}>
						{#if error}
							<div class="error">{error}</div>
						{/if}

						<div class="form-group">
							<label for="title">Title</label>
							<input type="text" id="title" bind:value={title} required />
						</div>

						<div class="form-group">
							<label for="date">Date</label>
							<input type="datetime-local" id="date" bind:value={date} required />
						</div>

						<div class="form-group">
							<label for="coverImage">Cover Image</label>
							<div class="image-input">
								<input
									type="text"
									id="coverImage"
									bind:value={coverImage}
									placeholder="e.g., image-name.png"
								/>
								<div class="image-help">
									<p>
										Image should be placed in the <code>/static/images/gallery/</code> directory.
									</p>
									<p>
										Enter just the filename (e.g., "image-name.png") - the system will automatically
										add the correct path.
									</p>
								</div>
							</div>
						</div>

						<div class="form-actions">
							<button
								type="button"
								class="preview-toggle"
								on:click={() => (showPreview = !showPreview)}
							>
								{showPreview ? 'Hide Preview' : 'Show Preview'}
							</button>
							<button type="submit" disabled={loading}>
								{loading ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</form>

					{#if showPreview}
						<div class="preview-section">
							<h2>Preview</h2>
							<article class="preview-content">
								<div class="header">
									<h1>{title || 'Untitled Post'}</h1>
								</div>
								{#if coverImage}
									<div class="cover-image">
										<Image src={coverImage} alt={title || 'Post cover image'} />
									</div>
								{/if}
							</article>
						</div>
					{/if}
				</div>
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
		padding: 40px 15px 80px;

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

		.header {
			text-align: center;
			margin-bottom: 2rem;
		}

		.content {
			max-width: var(--main-column-width);
			margin: 0 auto;
		}

		.editor-container {
			display: grid;
			gap: 2rem;
			grid-template-columns: 1fr;

			@include for-desktop-up {
				grid-template-columns: 1fr 1fr;
			}
		}

		form {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.form-group {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;

			label {
				font-weight: 500;
			}

			input {
				padding: 0.5rem;
				border: 1px solid var(--color--border);
				border-radius: 4px;
				background: var(--color--background);
				color: var(--color--text);
			}
		}

		.image-input {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.image-help {
			font-size: 0.875rem;
			color: rgba(var(--color--text-rgb), 0.8);

			code {
				background: var(--color--background-alt);
				padding: 0.2rem 0.4rem;
				border-radius: 4px;
			}
		}

		.error {
			background-color: var(--color--error);
			color: white;
			padding: 1rem;
			border-radius: 4px;
			margin-bottom: 1rem;
		}

		.form-actions {
			display: flex;
			gap: 1rem;
			justify-content: flex-end;
		}

		.preview-toggle {
			background: var(--color--background-alt);
			color: var(--color--text);
			border: 1px solid var(--color--border);
			padding: 0.5rem 1rem;
			border-radius: 4px;
			cursor: pointer;

			&:hover {
				background: var(--color--background);
			}
		}

		button:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}

		.preview-section {
			background: var(--color--background);
			border: 1px solid var(--color--border);
			border-radius: 4px;
			padding: 1rem;

			h2 {
				margin-bottom: 1rem;
				font-size: 1.25rem;
			}
		}

		.preview-content {
			.header {
				text-align: left;
				margin-bottom: 1rem;

				h1 {
					font-size: 1.5rem;
					margin-bottom: 0.5rem;
				}
			}

			.cover-image {
				margin: 1rem 0;
				border-radius: 4px;
				overflow: hidden;
			}
		}
	}
</style>
