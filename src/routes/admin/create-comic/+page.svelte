<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';
	import { title as siteTitle } from '$lib/data/meta';

	let title = '';
	let description = '';
	let isSeries = false;
	let error = '';
	let loading = false;

	// File uploads
	let coverImage: File | null = null;
	let pages: File[] = [];
	let coverPreview = '';
	let pagePreviews: string[] = [];

	function handleCoverImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			coverImage = input.files[0];
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				coverPreview = e.target?.result as string;
			};
			reader.readAsDataURL(coverImage);
		}
	}

	function handlePagesChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			pages = Array.from(input.files);
			// Create previews reactively
			createPagePreviews();
		}
	}

	function createPagePreviews() {
		pagePreviews = [];
		pages.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				pagePreviews = [...pagePreviews, e.target?.result as string];
			};
			reader.readAsDataURL(file);
		});
	}

	function removePage(index: number) {
		pages = pages.filter((_, i) => i !== index);
		// Recreate previews to maintain reactivity
		createPagePreviews();
	}

	function clearAllPages() {
		pages = [];
		pagePreviews = [];
		// Clear the file input
		const input = document.getElementById('pages') as HTMLInputElement;
		if (input) input.value = '';
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		if (!coverImage) {
			error = 'Please select a cover image';
			loading = false;
			return;
		}

		if (!isSeries && pages.length === 0) {
			error = 'Please select at least one page for short stories';
			loading = false;
			return;
		}

		try {
			const formData = new FormData();
			formData.append('title', title);
			formData.append('description', description);
			formData.append('isSeries', isSeries.toString());
			formData.append('coverImage', coverImage);

			// Add pages for short stories
			if (!isSeries) {
				pages.forEach((page) => {
					formData.append('pages', page);
				});
			}

			const response = await fetch('/api/create-comic', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create comic');
			}

			goto(`/comics`);
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Comic - {siteTitle}</title>
	<meta name="description" content="Create a new comic" />
</svelte:head>

<div class="article-layout">
	<Header showBackground />
	<WebsiteTabs />

	<main>
		<article id="article-content">
			<div class="header">
				<h1>Create New Comic</h1>
			</div>
			<div class="content">
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
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={isSeries} />
							<span>This is a series (multiple chapters)</span>
						</label>
						<div class="series-help">
							{#if isSeries}
								<p><strong>Series Structure:</strong></p>
								<ul>
									<li>Upload a series cover image</li>
									<li>Chapters will be added separately later</li>
									<li>Each chapter will have its own folder with numbered pages</li>
								</ul>
							{:else}
								<p><strong>Short Story Structure:</strong></p>
								<ul>
									<li>Upload a cover image and all comic pages</li>
									<li>Pages will be numbered automatically (1.jpg, 2.jpg, etc.)</li>
									<li>Make sure pages are in the correct order</li>
								</ul>
							{/if}
						</div>
					</div>

					<div class="form-group">
						<label for="coverImage">Cover Image</label>
						<input
							type="file"
							id="coverImage"
							accept="image/*"
							on:change={handleCoverImageChange}
							required
						/>
						<p class="help-text">This will be saved as 1.jpg in the comic directory.</p>
						{#if coverPreview}
							<div class="image-preview">
								<img src={coverPreview} alt="Cover preview" />
								<span class="cover-label">Cover (1.jpg)</span>
							</div>
						{/if}
					</div>

					{#if !isSeries}
						<div class="form-group">
							<label for="pages">Comic Pages</label>
							<input
								type="file"
								id="pages"
								accept="image/*"
								multiple
								on:change={handlePagesChange}
								required
							/>
							<p class="help-text">
								Select all pages in order. The cover image will be saved as 1.jpg, and pages will be
								numbered as 2.jpg, 3.jpg, etc.
							</p>

							{#if pagePreviews.length > 0}
								<div class="pages-preview">
									<div class="preview-header">
										<h4>Page Previews ({pagePreviews.length} pages):</h4>
										<button type="button" class="clear-all-btn" on:click={clearAllPages}>
											Clear All Pages
										</button>
									</div>
									<div class="pages-grid">
										{#each pagePreviews as preview, index}
											<div class="page-preview">
												<img src={preview} alt="Page {index + 2}" />
												<span class="page-number">Page {index + 2}.jpg</span>
												<button
													type="button"
													class="remove-page"
													on:click={() => removePage(index)}
													title="Remove this page"
												>
													×
												</button>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<button type="submit" disabled={loading}>
						{loading ? 'Creating...' : 'Create Comic'}
					</button>
				</form>
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

		.series-help {
			margin-top: 0.5rem;
			padding: 1rem;
			background: var(--color--background-alt);
			border-radius: 4px;
			font-size: 0.875rem;

			ul {
				margin: 0.5rem 0 0 1rem;
				padding: 0;
			}

			li {
				margin-bottom: 0.25rem;
			}
		}

		.help-text {
			font-size: 0.875rem;
			color: rgba(var(--color--text-rgb), 0.8);
			margin-top: 0.25rem;
		}

		.image-preview {
			margin-top: 1rem;
			max-width: 300px;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: var(--shadow--small);
			position: relative;

			img {
				width: 100%;
				height: auto;
				display: block;
			}

			.cover-label {
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
		}

		.pages-preview {
			margin-top: 1rem;

			.preview-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 1rem;

				h4 {
					margin: 0;
					font-size: 1rem;
				}

				.clear-all-btn {
					background: var(--color--error);
					color: white;
					border: none;
					padding: 0.5rem 1rem;
					border-radius: 4px;
					cursor: pointer;
					font-size: 0.875rem;

					&:hover {
						background: #d32f2f;
					}
				}
			}
		}

		.pages-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 1rem;
		}

		.page-preview {
			position: relative;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: var(--shadow--small);

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

		.error {
			background-color: var(--color--error);
			color: white;
			padding: 1rem;
			border-radius: 4px;
			margin-bottom: 1rem;
		}

		button:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}
</style>
