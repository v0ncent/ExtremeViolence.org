<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';
	import { title as siteTitle } from '$lib/data/meta';

	let title = '';
	let slug = '';
	let coverImage = '';
	let width = 0;
	let height = 0;
	let date = new Date().toISOString().slice(0, 16); // Default to current date/time
	let error = '';
	let loading = false;
	let detectingDimensions = false;
	let imagePreview = '';

	// Function to automatically detect image dimensions
	async function detectImageDimensions(imagePath: string) {
		if (!imagePath.trim()) {
			width = 0;
			height = 0;
			imagePreview = '';
			return;
		}

		detectingDimensions = true;

		try {
			// Normalize the image path
			let normalizedPath = imagePath;
			if (!imagePath.startsWith('/')) {
				normalizedPath = `/images/gallery/${imagePath}`;
			}

			// Create a temporary image element to get dimensions
			return new Promise<void>((resolve, reject) => {
				const img = new Image();

				img.onload = () => {
					width = img.naturalWidth;
					height = img.naturalHeight;
					imagePreview = normalizedPath;
					detectingDimensions = false;
					resolve();
				};

				img.onerror = () => {
					detectingDimensions = false;
					width = 0;
					height = 0;
					imagePreview = '';
					reject(new Error('Failed to load image'));
				};

				img.src = normalizedPath;
			});
		} catch (error) {
			detectingDimensions = false;
			console.error('Error detecting image dimensions:', error);
		}
	}

	// Watch for changes in coverImage and auto-detect dimensions
	$: if (coverImage) {
		detectImageDimensions(coverImage);
	}

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
			formData.append('title', title);
			formData.append('coverImage', normalizedImagePath);
			formData.append('date', isoDate);
			formData.append('width', width.toString());
			formData.append('height', height.toString());

			const response = await fetch('/api/create-gallery-post', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create gallery post');
			}

			// Redirect to the new post
			goto(`/gallery/${data.slug}`);
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Gallery Post - {siteTitle}</title>
	<meta name="description" content="Create a new gallery post" />
</svelte:head>

<div class="article-layout">
	<Header showBackground />
	<WebsiteTabs />

	<main>
		<article id="article-content">
			<div class="header">
				<h1>Create New Gallery Post</h1>
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
								placeholder="e.g., image-name.jpg"
								required
							/>
							<div class="image-help">
								<p>Image should be placed in the <code>/static/images/gallery/</code> directory.</p>
								<p>
									Enter just the filename (e.g., "image-name.jpg") - the system will automatically add the correct path.
								</p>
							</div>
						</div>
					</div>

					{#if detectingDimensions}
						<div class="form-group">
							<div class="detecting-dimensions">
								<p>Detecting image dimensions...</p>
							</div>
						</div>
					{:else if imagePreview && width > 0 && height > 0}
						<div class="form-group">
							<div class="image-preview-section">
								<label>Image Preview & Dimensions</label>
								<div class="image-preview">
									<img src={imagePreview} alt="Preview" />
									<div class="dimensions-info">
										<p><strong>Width:</strong> {width}px</p>
										<p><strong>Height:</strong> {height}px</p>
										<p><strong>Aspect Ratio:</strong> {(width / height).toFixed(2)}:1</p>
									</div>
								</div>
							</div>
						</div>
					{:else if coverImage && !detectingDimensions}
						<div class="form-group">
							<div class="error-message">
								<p>Could not load image. Please check the file path and try again.</p>
							</div>
						</div>
					{/if}

					<!-- Hidden inputs for width and height (auto-populated) -->
					<input type="hidden" bind:value={width} />
					<input type="hidden" bind:value={height} />

					{#if imagePreview && width > 0 && height > 0}
						<div class="form-group">
							<div class="manual-override">
								<label>Manual Override (Optional)</label>
								<div class="override-inputs">
									<div class="override-input">
										<label for="manualWidth">Width (px)</label>
										<input 
											type="number" 
											id="manualWidth" 
											bind:value={width} 
											placeholder="Auto-detected: {width}"
										/>
									</div>
									<div class="override-input">
										<label for="manualHeight">Height (px)</label>
										<input 
											type="number" 
											id="manualHeight" 
											bind:value={height} 
											placeholder="Auto-detected: {height}"
										/>
									</div>
								</div>
								<p class="override-help">You can manually adjust the dimensions if needed.</p>
							</div>
						</div>
					{/if}

					<button type="submit" disabled={loading}>
						{loading ? 'Creating...' : 'Create Gallery Post'}
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

		.detecting-dimensions {
			padding: 1rem;
			background: var(--color--background-alt);
			border-radius: 4px;
			text-align: center;
			color: rgba(var(--color--text-rgb), 0.8);
		}

		.image-preview-section {
			.image-preview {
				display: flex;
				gap: 1rem;
				align-items: flex-start;
				padding: 1rem;
				background: var(--color--background-alt);
				border-radius: 4px;
				border: 1px solid var(--color--border);

				img {
					max-width: 200px;
					max-height: 200px;
					object-fit: contain;
					border-radius: 4px;
					border: 1px solid var(--color--border);
				}

				.dimensions-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 0.5rem;

					p {
						margin: 0;
						font-size: 0.9rem;
						color: var(--color--text);

						strong {
							color: var(--color--primary);
						}
					}
				}
			}
		}

		.error-message {
			padding: 1rem;
			background: var(--color--error);
			color: white;
			border-radius: 4px;
			text-align: center;

			p {
				margin: 0;
			}
		}

		.manual-override {
			padding: 1rem;
			background: var(--color--background-alt);
			border-radius: 4px;
			border: 1px solid var(--color--border);

			label {
				font-weight: 500;
				margin-bottom: 0.5rem;
				display: block;
			}

			.override-inputs {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 1rem;
				margin-bottom: 0.5rem;
			}

			.override-input {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;

				label {
					font-size: 0.875rem;
					font-weight: 400;
					margin-bottom: 0;
				}

				input {
					padding: 0.5rem;
					border: 1px solid var(--color--border);
					border-radius: 4px;
					background: var(--color--background);
					color: var(--color--text);
					font-size: 0.875rem;
				}
			}

			.override-help {
				font-size: 0.8rem;
				color: rgba(var(--color--text-rgb), 0.7);
				margin: 0;
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
