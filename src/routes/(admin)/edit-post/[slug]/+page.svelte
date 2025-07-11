<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import Image from '$lib/components/atoms/Image.svelte';
	import dateformat from 'dateformat';
	import type { NewsPost } from '$lib/services/newsService';

	export let data: { post: NewsPost };

	let title = data.post.title;
	let content = data.post.html || '';
	let coverImage = data.post.coverImage;
	let error = '';
	let loading = false;
	let showPreview = false;

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('slug', data.post.slug);
			formData.append('title', title);
			formData.append('content', content);
			formData.append('coverImage', coverImage);

			const response = await fetch('/api/edit-post', {
				method: 'PUT',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to edit post');
			}

			// Add a timestamp to force a reload of the data
			const timestamp = new Date().getTime();
			window.location.href = `/${data.post.slug}?_t=${timestamp}`;
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="article-layout">
	<Header showBackground />
	<WebsiteTabs />

	<main>
		<article id="article-content">
			<div class="header">
				<h1>Edit Post</h1>
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
							<label for="content">Content</label>
							<textarea id="content" bind:value={content} required />
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
									<p>Image should be placed in the <code>/static/images/posts/</code> directory.</p>
									<p>
										Just enter the filename (e.g., "image-name.png") or the full path (e.g.,
										"/images/posts/image-name.png")
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
									<div class="note">{dateformat(new Date(), 'UTC:dd mmmm yyyy')}</div>
								</div>
								{#if coverImage}
									<div class="cover-image">
										<Image src={coverImage} alt={title || 'Post cover image'} />
									</div>
								{/if}
								<div class="content">
									{@html content}
								</div>
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

			input,
			textarea {
				padding: 0.5rem;
				border: 1px solid var(--color--border);
				border-radius: 4px;
				background: var(--color--background);
				color: var(--color--text);
			}

			textarea {
				min-height: 100px;
				resize: vertical;
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

		.tags-input {
			display: flex;
			gap: 0.5rem;

			input {
				flex: 1;
			}
		}

		.tags-list {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
			margin-top: 0.5rem;
		}

		.tag {
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
			padding: 0.25rem 0.5rem;
			background: var(--color--background-alt);
			border-radius: 4px;
			font-size: 0.875rem;

			button {
				background: none;
				border: none;
				color: var(--color--text);
				cursor: pointer;
				padding: 0;
				font-size: 1.25rem;
				line-height: 1;

				&:hover {
					color: var(--color--accent);
				}
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

			.content {
				font-size: 0.875rem;
				line-height: 1.6;
			}

			.tags {
				margin-top: 1rem;
				display: flex;
				flex-wrap: wrap;
				gap: 0.5rem;
			}
		}
	}
</style>
