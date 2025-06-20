<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';
	import Image from '$lib/components/atoms/Image.svelte';
	import type { BlogPost } from '$lib/utils/types';
	import { onMount } from 'svelte';

	export let data: { post: BlogPost };

	// Initialize form data with safe defaults
	let title = data?.post?.title || '';
	let description = data?.post?.description || '';
	let isSeries = data?.post?.series || false;
	let error = '';
	let loading = false;

	// File uploads for editing
	let newCoverImage: File | null = null;
	let coverPreview = '';
	let newPages: File[] = [];
	let pagePreviews: string[] = [];

	// Page management
	let existingPages: string[] = [];
	let pagesToDelete: string[] = [];

	function handleCoverImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			newCoverImage = input.files[0];
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				coverPreview = e.target?.result as string;
			};
			reader.readAsDataURL(newCoverImage);
		}
	}

	function handlePagesChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			newPages = Array.from(input.files);
			// Create previews
			pagePreviews = [];
			newPages.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					pagePreviews.push(e.target?.result as string);
				};
				reader.readAsDataURL(file);
			});
		}
	}

	function removeNewPage(index: number) {
		newPages = newPages.filter((_, i) => i !== index);
		pagePreviews = pagePreviews.filter((_, i) => i !== index);
	}

	function togglePageDelete(pageNumber: string) {
		if (pagesToDelete.includes(pageNumber)) {
			pagesToDelete = pagesToDelete.filter((p) => p !== pageNumber);
		} else {
			pagesToDelete = [...pagesToDelete, pageNumber];
		}
	}

	// Load existing pages on mount
	async function loadExistingPages() {
		if (!isSeries && data?.post?.slug) {
			try {
				const response = await fetch(`/api/comic-pages/${data.post.slug}`);
				if (response.ok) {
					const data = await response.json();
					existingPages = data.pages;
				}
			} catch (error) {
				console.error('Failed to load existing pages:', error);
			}
		}
	}

	// Load pages when component mounts
	onMount(() => {
		loadExistingPages();
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('slug', data.post.slug);
			formData.append('title', title);
			formData.append('description', description);
			formData.append('isSeries', isSeries.toString());

			// If a new cover image was uploaded, include it
			if (newCoverImage) {
				formData.append('coverImage', newCoverImage);
			}

			// Add new pages for short stories
			if (!isSeries && newPages.length > 0) {
				newPages.forEach((page) => {
					formData.append('newPages', page);
				});
			}

			// Add pages to delete
			if (pagesToDelete.length > 0) {
				formData.append('pagesToDelete', JSON.stringify(pagesToDelete));
			}

			const response = await fetch('/api/edit-comic', {
				method: 'PUT',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to edit comic');
			}

			// Redirect to comics section after successful edit
			goto('/comics');
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
				<h1>Edit Comic</h1>
			</div>
			<div class="content">
				{#if data?.post}
					<form on:submit={handleSubmit}>
						{#if error}
							<div class="error">{error}</div>
						{/if}

						<div class="form-group">
							<label for="title">Title</label>
							<input type="text" id="title" bind:value={title} required />
						</div>

						<div class="form-group">
							<label for="description">Description</label>
							<textarea
								id="description"
								bind:value={description}
								placeholder="Enter a description for your comic..."
								required
							/>
						</div>

						<div class="form-group">
							<label for="coverImage">Cover Image</label>
							<div class="image-input">
								<input
									type="file"
									id="coverImage"
									accept="image/*"
									on:change={handleCoverImageChange}
								/>
								<div class="image-help">
									<p>Leave empty to keep the current cover image, or upload a new one.</p>
									{#if data.post.coverImage && !newCoverImage}
										<div class="current-image">
											<p>Current cover image:</p>
											<img src={data.post.coverImage} alt="Current cover" />
										</div>
									{/if}
								</div>
							</div>
							{#if coverPreview}
								<div class="image-preview">
									<p>New cover preview:</p>
									<img src={coverPreview} alt="New cover preview" />
								</div>
							{/if}
						</div>

						<div class="form-group">
							<label class="checkbox-label">
								<input type="checkbox" bind:checked={isSeries} />
								<span>This is a series (multiple chapters)</span>
							</label>
						</div>

						{#if !isSeries}
							<div class="form-group">
								<label>Comic Pages Management</label>

								{#if existingPages.length > 0}
									<div class="existing-pages">
										<h4>Current Pages ({existingPages.length}):</h4>
										<div class="pages-grid">
											{#each existingPages as pageNumber}
												<div class="page-item">
													<img
														src={`/images/comics/${data.post.slug}/${pageNumber}.jpg`}
														alt="Page {pageNumber}"
													/>
													<span class="page-number">Page {pageNumber}</span>
													<label class="delete-checkbox">
														<input
															type="checkbox"
															checked={pagesToDelete.includes(pageNumber)}
															on:change={() => togglePageDelete(pageNumber)}
														/>
														Delete
													</label>
												</div>
											{/each}
										</div>
									</div>
								{:else}
									<div class="no-pages">
										<p>No existing pages found.</p>
									</div>
								{/if}

								<div class="add-pages">
									<h4>Add New Pages:</h4>
									<input
										type="file"
										id="pages"
										accept="image/*"
										multiple
										on:change={handlePagesChange}
									/>
									<p class="help-text">
										Select new pages to add. They will be numbered sequentially after existing
										pages.
									</p>

									{#if pagePreviews.length > 0}
										<div class="new-pages-preview">
											<h5>New Pages to Add ({pagePreviews.length}):</h5>
											<div class="pages-grid">
												{#each pagePreviews as preview, index}
													<div class="page-preview">
														<img src={preview} alt="New page {index + 1}" />
														<span class="page-number">New Page {index + 1}</span>
														<button
															type="button"
															class="remove-page"
															on:click={() => removeNewPage(index)}
														>
															×
														</button>
													</div>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
						{/if}

						<div class="form-actions">
							<button type="submit" disabled={loading}>
								{loading ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</form>
				{:else}
					<div class="error">
						<p>Comic not found or loading...</p>
					</div>
				{/if}
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

			input[type='file'] {
				padding: 0.5rem;
				border: 2px dashed var(--color--border);
				border-radius: 4px;
				background: var(--color--background);
				cursor: pointer;

				&:hover {
					border-color: var(--color--accent);
				}
			}
		}

		.checkbox-label {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			cursor: pointer;

			input[type='checkbox'] {
				width: auto;
				margin: 0;
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

			.current-image {
				margin-top: 1rem;
				padding: 1rem;
				background: var(--color--background-alt);
				border-radius: 4px;

				img {
					max-width: 200px;
					height: auto;
					border-radius: 4px;
					margin-top: 0.5rem;
				}
			}
		}

		.image-preview {
			margin-top: 1rem;
			max-width: 300px;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: var(--shadow--small);

			p {
				margin-bottom: 0.5rem;
				font-size: 0.875rem;
				color: var(--color--text-muted);
			}

			img {
				width: 100%;
				height: auto;
				display: block;
			}
		}

		.existing-pages,
		.add-pages {
			margin-top: 1rem;
			padding: 1rem;
			background: var(--color--background-alt);
			border-radius: 4px;

			h4,
			h5 {
				margin-bottom: 1rem;
				font-size: 1rem;
			}
		}

		.no-pages {
			margin-top: 1rem;
			padding: 1rem;
			background: var(--color--background-alt);
			border-radius: 4px;
			text-align: center;
			color: var(--color--text-muted);
		}

		.pages-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 1rem;
		}

		.page-item,
		.page-preview {
			position: relative;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: var(--shadow--small);
			background: var(--color--background);

			img {
				width: 100%;
				height: auto;
				display: block;
			}

			.page-number {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				background: rgba(0, 0, 0, 0.7);
				color: white;
				padding: 0.25rem;
				text-align: center;
				font-size: 0.75rem;
			}

			.delete-checkbox {
				position: absolute;
				top: 0.25rem;
				left: 0.25rem;
				background: rgba(255, 0, 0, 0.8);
				color: white;
				padding: 0.25rem 0.5rem;
				border-radius: 4px;
				font-size: 0.75rem;
				display: flex;
				align-items: center;
				gap: 0.25rem;

				input[type='checkbox'] {
					margin: 0;
				}
			}

			.remove-page {
				position: absolute;
				top: 0.25rem;
				right: 0.25rem;
				background: var(--color--error);
				color: white;
				border: none;
				border-radius: 50%;
				width: 24px;
				height: 24px;
				cursor: pointer;
				font-size: 1rem;
				line-height: 1;

				&:hover {
					background: #d32f2f;
				}
			}
		}

		.help-text {
			font-size: 0.875rem;
			color: rgba(var(--color--text-rgb), 0.8);
			margin-top: 0.25rem;
		}

		.error {
			background-color: var(--color--error);
			color: white;
			padding: 1rem;
			border-radius: 4px;
			margin-bottom: 1rem;
			text-align: center;
		}

		.form-actions {
			display: flex;
			gap: 1rem;
			justify-content: flex-end;
		}

		button:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}
</style>
