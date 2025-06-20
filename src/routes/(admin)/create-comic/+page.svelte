<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';

	let title = '';
	let description = '';
	let isSeries = false;
	let tags: string[] = [];
	let currentTag = '';
	let error = '';
	let loading = false;

	// File uploads
	let coverImage: File | null = null;
	let pages: File[] = [];
	let coverPreview = '';
	let pagePreviews: string[] = [];

	function addTag() {
		if (currentTag && !tags.includes(currentTag)) {
			tags = [...tags, currentTag];
			currentTag = '';
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}

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
			// Create previews
			pagePreviews = [];
			pages.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					pagePreviews.push(e.target?.result as string);
				};
				reader.readAsDataURL(file);
			});
		}
	}

	function removePage(index: number) {
		pages = pages.filter((_, i) => i !== index);
		pagePreviews = pagePreviews.filter((_, i) => i !== index);
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
			formData.append('tags', tags.join(','));
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
						{#if coverPreview}
							<div class="image-preview">
								<img src={coverPreview} alt="Cover preview" />
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
								Select all pages in order. They will be numbered automatically.
							</p>

							{#if pagePreviews.length > 0}
								<div class="pages-preview">
									<h4>Page Previews ({pagePreviews.length} pages):</h4>
									<div class="pages-grid">
										{#each pagePreviews as preview, index}
											<div class="page-preview">
												<img src={preview} alt="Page {index + 1}" />
												<span class="page-number">Page {index + 1}</span>
												<button
													type="button"
													class="remove-page"
													on:click={() => removePage(index)}
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

					<div class="form-group">
						<label for="tags">Tags</label>
						<div class="tags-input">
							<input
								type="text"
								id="tags"
								bind:value={currentTag}
								on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
							/>
							<button type="button" on:click={addTag}>Add Tag</button>
						</div>
						<div class="tags-list">
							{#each tags as tag}
								<span class="tag">
									{tag}
									<button type="button" on:click={() => removeTag(tag)}>×</button>
								</span>
							{/each}
						</div>
					</div>

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

			img {
				width: 100%;
				height: auto;
				display: block;
			}
		}

		.pages-preview {
			margin-top: 1rem;

			h4 {
				margin-bottom: 1rem;
				font-size: 1rem;
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

		button:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}
</style>
