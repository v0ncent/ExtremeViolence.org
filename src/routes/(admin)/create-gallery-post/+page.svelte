<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';

	let title = '';
	let slug = '';
	let coverImage = '';
	let tags: string[] = [];
	let currentTag = '';
	let error = '';
	let loading = false;

	function addTag() {
		if (currentTag && !tags.includes(currentTag)) {
			tags = [...tags, currentTag];
			currentTag = '';
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('title', title);
			formData.append('slug', slug);
			formData.append('coverImage', coverImage);
			formData.append('tags', tags.join(','));

			const response = await fetch('/api/create-gallery-post', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create gallery post');
			}

			// Redirect to the new post
			goto(`/${data.slug}`);
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
									Just enter the filename (e.g., "image-name.jpg") or the full path (e.g.,
									"/images/gallery/image-name.jpg")
								</p>
							</div>
						</div>
					</div>

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
