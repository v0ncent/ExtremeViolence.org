<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { goto } from '$app/navigation';
	import type { ComicsContentModel } from '$lib/utils/types';
	import { title as siteTitle } from '$lib/data/meta';

	export let data: { post: ComicsContentModel };

	let title = data.post.title;
	let description = data.post.description;
	let isSeries = data.post.series;
	let error = '';
	let loading = false;

	// File uploads
	let newCoverImage: File | null = null;
	let coverPreview = '';

	// Page management for non-series comics
	let existingPages: { path: string; number: number }[] = [];
	let newPages: File[] = [];
	let newPagePreviews: { preview: string; id: string }[] = [];
	let pagesToDelete: number[] = [];
	let newPagesToDelete: string[] = [];
	let pageOrder: (number | string)[] = []; // number for existing pages, string for new pages
	let draggedPage: number | string | null = null;
	let draggedOverPage: number | string | null = null;

	// Chapter management for series
	let existingChapters: string[] = [];
	let chaptersToDelete: string[] = [];
	let newChapters: { name: string; files: File[] }[] = [];
	let newChapterPreviews: { chapterName: string; previews: { preview: string; id: string }[] }[] =
		[];

	// Chapter page management
	let existingChapterPages: { [chapterName: string]: { path: string; number: number }[] } = {};
	let chapterPageOrders: { [chapterName: string]: (number | string)[] } = {};
	let chapterPagesToDelete: { [chapterName: string]: number[] } = {};
	let chapterNewPagesToDelete: { [chapterName: string]: string[] } = {};
	let draggedChapterPage: { chapterName: string; pageId: number | string } | null = null;
	let draggedOverChapterPage: { chapterName: string; pageId: number | string } | null = null;

	// Load existing pages if it's not a series
	async function loadExistingPages() {
		if (!isSeries) {
			try {
				const res = await fetch(`/api/comic-pages/${data.post.slug}`);
				if (res.ok) {
					const data = await res.json();
					existingPages = data.pages || [];
					pageOrder = existingPages.map((p) => p.number);
				}
			} catch (error) {
				console.error('Error loading pages:', error);
			}
		}
	}

	// Load existing chapters if it's a series
	async function loadExistingChapters() {
		if (isSeries) {
			try {
				const res = await fetch(`/api/chapters/${data.post.slug}`);
				if (res.ok) {
					const data = await res.json();
					existingChapters = data.chapters;

					// Load existing pages for each chapter
					for (const chapter of existingChapters) {
						await loadChapterPages(chapter);
					}
				}
			} catch (error) {
				console.error('Error loading chapters:', error);
			}
		}
	}

	// Load existing pages for a specific chapter
	async function loadChapterPages(chapterName: string) {
		try {
			const res = await fetch(`/api/comic-pages/${data.post.slug}/${chapterName}`);
			if (res.ok) {
				const data = await res.json();
				existingChapterPages[chapterName] = data.pages || [];
				chapterPageOrders[chapterName] = existingChapterPages[chapterName].map((p) => p.number);
				chapterPagesToDelete[chapterName] = [];
				chapterNewPagesToDelete[chapterName] = [];
			} else {
				console.error(`Failed to load pages for chapter ${chapterName}:`, res.status);
			}
		} catch (error) {
			console.error(`Error loading pages for chapter ${chapterName}:`, error);
		}
	}

	// Load data on mount
	loadExistingPages();
	loadExistingChapters();

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
			const files = Array.from(input.files);
			newPages = [...newPages, ...files];

			// Create previews for new files
			files.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const id = `new_${Date.now()}_${Math.random()}`;
					newPagePreviews.push({
						preview: e.target?.result as string,
						id: id
					});
					pageOrder.push(id);
				};
				reader.readAsDataURL(file);
			});
		}
	}

	function removePage(id: string) {
		newPages = newPages.filter((_, i) => i !== newPagePreviews.findIndex((p) => p.id === id));
		newPagePreviews = newPagePreviews.filter((p) => p.id !== id);
		pageOrder = pageOrder.filter((p) => p !== id);
	}

	function togglePageDelete(pageNumber: number) {
		if (pagesToDelete.includes(pageNumber)) {
			pagesToDelete = pagesToDelete.filter((p) => p !== pageNumber);
		} else {
			pagesToDelete = [...pagesToDelete, pageNumber];
		}
	}

	function toggleNewPageDelete(id: string) {
		if (newPagesToDelete.includes(id)) {
			newPagesToDelete = newPagesToDelete.filter((p) => p !== id);
		} else {
			newPagesToDelete = [...newPagesToDelete, id];
		}
	}

	function handleDragStart(event: DragEvent, pageId: number | string) {
		draggedPage = pageId;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', pageId.toString());
		}
	}

	function handleDragOver(event: DragEvent, pageId: number | string) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
		draggedOverPage = pageId;
	}

	function handleDragEnter(event: DragEvent, pageId: number | string) {
		event.preventDefault();
		draggedOverPage = pageId;
	}

	function handleDragLeave(event: DragEvent) {
		// Only clear if we're leaving the drop zone entirely
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = event.clientX;
		const y = event.clientY;

		if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
			draggedOverPage = null;
		}
	}

	function handleDrop(event: DragEvent, targetPageId: number | string) {
		event.preventDefault();

		if (draggedPage !== null && draggedPage !== targetPageId) {
			const draggedIndex = pageOrder.indexOf(draggedPage);
			const targetIndex = pageOrder.indexOf(targetPageId);

			if (draggedIndex !== -1 && targetIndex !== -1) {
				const newOrder = [...pageOrder];
				// Remove dragged item from its current position
				newOrder.splice(draggedIndex, 1);
				// Insert it at the target position
				newOrder.splice(targetIndex, 0, draggedPage);
				pageOrder = newOrder;
			}
		}

		draggedPage = null;
		draggedOverPage = null;
	}

	function handleDragEnd() {
		draggedPage = null;
		draggedOverPage = null;
	}

	function toggleChapterDelete(chapter: string) {
		if (chaptersToDelete.includes(chapter)) {
			chaptersToDelete = chaptersToDelete.filter((c) => c !== chapter);
		} else {
			chaptersToDelete = [...chaptersToDelete, chapter];
		}
	}

	function addNewChapter() {
		const chapterName = `chapter${existingChapters.length + newChapters.length + 1}`;
		newChapters = [...newChapters, { name: chapterName, files: [] }];
		newChapterPreviews = [...newChapterPreviews, { chapterName, previews: [] }];
	}

	function handleChapterFilesChange(event: Event, chapterName: string) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const files = Array.from(input.files);
			const chapterIndex = newChapters.findIndex((c) => c.name === chapterName);

			if (chapterIndex !== -1) {
				// Update files array reactively
				newChapters = newChapters.map((chapter, index) =>
					index === chapterIndex ? { ...chapter, files: [...chapter.files, ...files] } : chapter
				);

				// Initialize page order for this chapter if it doesn't exist
				if (!chapterPageOrders[chapterName]) {
					chapterPageOrders[chapterName] = [];
				}

				// Create previews for new files
				files.forEach((file, fileIndex) => {
					const reader = new FileReader();
					reader.onload = (e) => {
						const id = `new_${chapterName}_${Date.now()}_${fileIndex}_${Math.random()}`;

						// Update previews reactively
						newChapterPreviews = newChapterPreviews.map((previewGroup) =>
							previewGroup.chapterName === chapterName
								? {
										...previewGroup,
										previews: [
											...previewGroup.previews,
											{ preview: e.target?.result as string, id }
										]
								  }
								: previewGroup
						);

						// Add to page order for this chapter
						chapterPageOrders[chapterName] = [...chapterPageOrders[chapterName], id];
					};
					reader.readAsDataURL(file);
				});
			}
		}
	}

	function removeChapter(chapterName: string) {
		newChapters = newChapters.filter((c) => c.name !== chapterName);
		newChapterPreviews = newChapterPreviews.filter((p) => p.chapterName !== chapterName);
	}

	// Chapter page management functions
	function toggleChapterPageDelete(chapterName: string, pageNumber: number) {
		if (!chapterPagesToDelete[chapterName]) {
			chapterPagesToDelete[chapterName] = [];
		}
		if (chapterPagesToDelete[chapterName].includes(pageNumber)) {
			chapterPagesToDelete[chapterName] = chapterPagesToDelete[chapterName].filter(
				(p) => p !== pageNumber
			);
		} else {
			chapterPagesToDelete[chapterName] = [...chapterPagesToDelete[chapterName], pageNumber];
		}
	}

	function toggleChapterNewPageDelete(chapterName: string, id: string) {
		if (!chapterNewPagesToDelete[chapterName]) {
			chapterNewPagesToDelete[chapterName] = [];
		}
		if (chapterNewPagesToDelete[chapterName].includes(id)) {
			chapterNewPagesToDelete[chapterName] = chapterNewPagesToDelete[chapterName].filter(
				(p) => p !== id
			);
		} else {
			chapterNewPagesToDelete[chapterName] = [...chapterNewPagesToDelete[chapterName], id];
		}
	}

	function handleChapterPageDragStart(
		event: DragEvent,
		chapterName: string,
		pageId: number | string
	) {
		draggedChapterPage = { chapterName, pageId };
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', `${chapterName}:${pageId}`);
		}
	}

	function handleChapterPageDragOver(
		event: DragEvent,
		chapterName: string,
		pageId: number | string
	) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
		draggedOverChapterPage = { chapterName, pageId };
	}

	function handleChapterPageDrop(
		event: DragEvent,
		targetChapterName: string,
		targetPageId: number | string
	) {
		event.preventDefault();

		if (
			draggedChapterPage &&
			(draggedChapterPage.chapterName !== targetChapterName ||
				draggedChapterPage.pageId !== targetPageId)
		) {
			const order = chapterPageOrders[targetChapterName] || [];
			const draggedIndex = order.indexOf(draggedChapterPage.pageId);
			const targetIndex = order.indexOf(targetPageId);

			if (draggedIndex !== -1 && targetIndex !== -1) {
				const newOrder = [...order];
				newOrder.splice(draggedIndex, 1);
				newOrder.splice(targetIndex, 0, draggedChapterPage.pageId);
				chapterPageOrders[targetChapterName] = newOrder;
			}
		}

		draggedChapterPage = null;
		draggedOverChapterPage = null;
	}

	function handleChapterPageDragEnd() {
		draggedChapterPage = null;
		draggedOverChapterPage = null;
	}

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

			if (newCoverImage) {
				formData.append('newCoverImage', newCoverImage);
			}

			// Add new pages that aren't marked for deletion
			const newPagesToSubmit = newPages.filter((_, index) => {
				const preview = newPagePreviews[index];
				return preview && !newPagesToDelete.includes(preview.id);
			});

			newPagesToSubmit.forEach((page) => {
				formData.append('newPages', page);
			});

			pagesToDelete.forEach((pageNumber) => {
				formData.append('pagesToDelete', pageNumber.toString());
			});

			// Create page order mapping for existing pages only
			const existingPageOrder = pageOrder
				.filter((id) => typeof id === 'number')
				.map((pageNumber, index) => `${pageNumber}:${index + 1}`);

			existingPageOrder.forEach((orderStr) => {
				formData.append('pageOrder', orderStr);
			});

			chaptersToDelete.forEach((chapter) => {
				formData.append('chaptersToDelete', chapter);
			});

			// Add new chapters (excluding pages marked for deletion)
			newChapters.forEach((chapter) => {
				const chapterPreviews = newChapterPreviews.find((p) => p.chapterName === chapter.name);
				const pagesToExclude = chapterNewPagesToDelete[chapter.name] || [];

				// Filter out files that correspond to deleted previews
				const filesToSubmit = chapter.files.filter((_, index) => {
					if (!chapterPreviews?.previews) return true;
					const preview = chapterPreviews.previews[index];
					return preview && !pagesToExclude.includes(preview.id);
				});

				filesToSubmit.forEach((file) => {
					formData.append(`newChapters_${chapter.name}`, file);
				});
			});

			// Handle chapter page deletions
			Object.entries(chapterPagesToDelete).forEach(([chapterName, pageNumbers]) => {
				pageNumbers.forEach((pageNumber) => {
					formData.append(`chapterPagesToDelete_${chapterName}`, pageNumber.toString());
				});
			});

			// Handle chapter page reordering
			Object.entries(chapterPageOrders).forEach(([chapterName, pageOrder]) => {
				const existingPageOrder = pageOrder
					.filter((id) => typeof id === 'number')
					.map((pageNumber, index) => `${pageNumber}:${index + 1}`);

				existingPageOrder.forEach((orderStr) => {
					formData.append(`chapterPageOrder_${chapterName}`, orderStr);
				});
			});

			const response = await fetch('/api/edit-comic', {
				method: 'PUT',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update comic');
			}

			// Redirect to the comic details page
			goto(`/comic-details/${data.post.slug}`);
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Edit {data.post.title} - {siteTitle}</title>
	<meta name="description" content="Edit comic: {data.post.title}" />
</svelte:head>

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

								<div class="all-pages">
									<h4>All Pages ({pageOrder.length}):</h4>
									<div class="pages-grid">
										{#each pageOrder as pageId, index}
											{#if typeof pageId === 'number'}
												{@const page = existingPages.find((p) => p.number === pageId)}
												{#if page}
													<div
														class="page-item"
														class:dragging={draggedPage === pageId}
														class:drag-over={draggedOverPage === pageId}
														draggable="true"
														on:dragstart={(e) => handleDragStart(e, pageId)}
														on:dragover={(e) => handleDragOver(e, pageId)}
														on:dragenter={(e) => handleDragEnter(e, pageId)}
														on:dragleave={handleDragLeave}
														on:drop={(e) => handleDrop(e, pageId)}
														on:dragend={handleDragEnd}
													>
														<img src={page.path} alt="Page {pageId}" />
														<span class="page-number">Page {pageId}</span>
														<div class="page-controls">
															<label class="delete-checkbox">
																<input
																	type="checkbox"
																	checked={pagesToDelete.includes(pageId)}
																	on:change={() => togglePageDelete(pageId)}
																/>
																Delete
															</label>
														</div>
														<div class="drag-handle">⋮⋮</div>
													</div>
												{/if}
											{:else}
												{@const newPage = newPagePreviews.find((p) => p.id === pageId)}
												{#if newPage}
													<div
														class="page-item new-page"
														class:dragging={draggedPage === pageId}
														class:drag-over={draggedOverPage === pageId}
														draggable="true"
														on:dragstart={(e) => handleDragStart(e, pageId)}
														on:dragover={(e) => handleDragOver(e, pageId)}
														on:dragenter={(e) => handleDragEnter(e, pageId)}
														on:dragleave={handleDragLeave}
														on:drop={(e) => handleDrop(e, pageId)}
														on:dragend={handleDragEnd}
													>
														<img src={newPage.preview} alt="New page" />
														<span class="page-number">New Page</span>
														<div class="page-controls">
															<label class="delete-checkbox">
																<input
																	type="checkbox"
																	checked={newPagesToDelete.includes(pageId)}
																	on:change={() => toggleNewPageDelete(pageId)}
																/>
																Delete
															</label>
														</div>
														<div class="drag-handle">⋮⋮</div>
													</div>
												{/if}
											{/if}
										{/each}
									</div>
								</div>

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
										Select new pages to add. They will appear in the preview above where you can
										reorder them.
									</p>
								</div>
							</div>
						{:else}
							<div class="form-group">
								<label>Chapter Management</label>

								{#if existingChapters.length > 0}
									<div class="existing-chapters">
										<h4>Current Chapters ({existingChapters.length}):</h4>
										<div class="chapters-grid">
											{#each existingChapters as chapter}
												<div class="chapter-item">
													<img
														src={`/images/comics/${data.post.slug}/${chapter}/1.jpg`}
														alt="Chapter {chapter}"
													/>
													<span class="chapter-name">Chapter {chapter.replace('chapter', '')}</span>
													<label class="delete-checkbox">
														<input
															type="checkbox"
															checked={chaptersToDelete.includes(chapter)}
															on:change={() => toggleChapterDelete(chapter)}
														/>
														Delete
													</label>
												</div>
											{/each}
										</div>

										<!-- Chapter Pages Management -->
										{#each existingChapters as chapter}
											{#if !chaptersToDelete.includes(chapter)}
												<div class="chapter-pages-management">
													<h5>Pages for {chapter}:</h5>
													{#if existingChapterPages[chapter] && existingChapterPages[chapter].length > 0}
														<div class="pages-grid">
															{#each chapterPageOrders[chapter] || [] as pageId}
																{#if typeof pageId === 'number'}
																	{@const page = existingChapterPages[chapter]?.find(
																		(p) => p.number === pageId
																	)}
																	{#if page}
																		<div
																			class="page-item"
																			class:dragging={draggedChapterPage?.chapterName === chapter &&
																				draggedChapterPage?.pageId === pageId}
																			class:drag-over={draggedOverChapterPage?.chapterName ===
																				chapter && draggedOverChapterPage?.pageId === pageId}
																			class:marked-for-deletion={chapterPagesToDelete[
																				chapter
																			]?.includes(pageId)}
																			draggable="true"
																			on:dragstart={(e) =>
																				handleChapterPageDragStart(e, chapter, pageId)}
																			on:dragover={(e) =>
																				handleChapterPageDragOver(e, chapter, pageId)}
																			on:drop={(e) => handleChapterPageDrop(e, chapter, pageId)}
																			on:dragend={handleChapterPageDragEnd}
																		>
																			<img src={page.path} alt="Page {pageId}" />
																			<span class="page-number">Page {pageId}</span>
																			<div class="page-controls">
																				<label class="delete-checkbox">
																					<input
																						type="checkbox"
																						checked={chapterPagesToDelete[chapter]?.includes(
																							pageId
																						) || false}
																						on:change={() =>
																							toggleChapterPageDelete(chapter, pageId)}
																					/>
																					Delete
																				</label>
																			</div>
																			<div class="drag-handle">⋮⋮</div>
																		</div>
																	{/if}
																{:else}
																	{@const newPage = newChapterPreviews
																		.find((p) => p.chapterName === chapter)
																		?.previews.find((preview) => preview.id === pageId)}
																	{#if newPage}
																		<div
																			class="page-item new-page"
																			class:dragging={draggedChapterPage?.chapterName === chapter &&
																				draggedChapterPage?.pageId === pageId}
																			class:drag-over={draggedOverChapterPage?.chapterName ===
																				chapter && draggedOverChapterPage?.pageId === pageId}
																			draggable="true"
																			on:dragstart={(e) =>
																				handleChapterPageDragStart(e, chapter, pageId)}
																			on:dragover={(e) =>
																				handleChapterPageDragOver(e, chapter, pageId)}
																			on:drop={(e) => handleChapterPageDrop(e, chapter, pageId)}
																			on:dragend={handleChapterPageDragEnd}
																		>
																			<img src={newPage.preview} alt="New page" />
																			<span class="page-number">New Page</span>
																			<div class="page-controls">
																				<label class="delete-checkbox">
																					<input
																						type="checkbox"
																						checked={chapterNewPagesToDelete[chapter]?.includes(
																							pageId
																						) || false}
																						on:change={() =>
																							toggleChapterNewPageDelete(chapter, pageId)}
																					/>
																					Delete
																				</label>
																			</div>
																			<div class="drag-handle">⋮⋮</div>
																		</div>
																	{/if}
																{/if}
															{/each}
														</div>

														<!-- Summary of changes -->
														{#if (chapterPagesToDelete[chapter] && chapterPagesToDelete[chapter].length > 0) || (chapterNewPagesToDelete[chapter] && chapterNewPagesToDelete[chapter].length > 0)}
															<div class="changes-summary">
																<h6>Changes for {chapter}:</h6>
																{#if chapterPagesToDelete[chapter] && chapterPagesToDelete[chapter].length > 0}
																	<p>Pages to delete: {chapterPagesToDelete[chapter].join(', ')}</p>
																{/if}
																{#if chapterNewPagesToDelete[chapter] && chapterNewPagesToDelete[chapter].length > 0}
																	<p>
																		New pages to delete: {chapterNewPagesToDelete[chapter].length} pages
																	</p>
																{/if}
															</div>
														{/if}
													{:else}
														<p>No pages found for this chapter.</p>
													{/if}
												</div>
											{/if}
										{/each}
									</div>
								{:else}
									<div class="no-chapters">
										<p>No existing chapters found.</p>
									</div>
								{/if}

								<div class="add-chapter">
									<h4>Add New Chapters:</h4>
									<button type="button" class="add-chapter-btn" on:click={addNewChapter}>
										+ Add New Chapter
									</button>

									{#if newChapters.length > 0}
										<div class="new-chapters">
											{#each newChapters as chapter}
												<div class="new-chapter-section">
													<div class="chapter-header">
														<h5>{chapter.name}</h5>
														<button
															type="button"
															class="remove-chapter-btn"
															on:click={() => removeChapter(chapter.name)}
														>
															Remove Chapter
														</button>
													</div>

													<div class="chapter-pages-input">
														<input
															type="file"
															accept="image/*"
															multiple
															on:change={(e) => handleChapterFilesChange(e, chapter.name)}
														/>
														<p class="help-text">
															Select pages for {chapter.name}. They will appear in the preview
															below.
														</p>
													</div>

													{#if newChapterPreviews.find((p) => p.chapterName === chapter.name)?.previews?.length > 0}
														<div class="chapter-pages-preview">
															<h6>Pages for {chapter.name}:</h6>
															<div class="pages-grid">
																{#each (newChapterPreviews.find((p) => p.chapterName === chapter.name)?.previews || []).filter((p) => p) as preview}
																	<div class="page-preview">
																		<img src={preview.preview} alt="Page preview" />
																		<span class="page-number">New Page</span>
																	</div>
																{/each}
															</div>
														</div>
													{/if}
												</div>
											{/each}
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
		.add-pages,
		.existing-chapters,
		.add-chapter {
			margin-top: 1rem;
			padding: 1rem;
			background: var(--color--background-alt);
			border-radius: 4px;

			h4,
			h5,
			h6 {
				margin-bottom: 1rem;
				font-size: 1rem;
			}

			.add-chapter-btn {
				background: var(--color--primary);
				color: white;
				border: none;
				padding: 0.5rem 1rem;
				border-radius: 4px;
				cursor: pointer;
				font-weight: bold;
				margin-bottom: 1rem;

				&:hover {
					background: var(--color--primary-dark);
				}
			}

			.new-chapters {
				display: flex;
				flex-direction: column;
				gap: 1rem;
			}

			.new-chapter-section {
				padding: 1rem;
				background: var(--color--background);
				border-radius: 4px;
				border: 1px solid var(--color--border);
			}

			.chapter-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 1rem;

				h5 {
					margin: 0;
					color: var(--color--text);
				}

				.remove-chapter-btn {
					background: var(--color--error);
					color: white;
					border: none;
					padding: 0.25rem 0.5rem;
					border-radius: 4px;
					cursor: pointer;
					font-size: 0.75rem;

					&:hover {
						background: #d32f2f;
					}
				}
			}

			.chapter-pages-input {
				margin-bottom: 1rem;
			}

			.chapter-pages-preview {
				margin-top: 1rem;
				padding: 1rem;
				background: var(--color--background-alt);
				border-radius: 4px;

				h6 {
					margin: 0 0 1rem 0;
					color: var(--color--text);
				}
			}

			.chapter-pages-management {
				margin-top: 2rem;
				padding: 1rem;
				background: var(--color--background);
				border-radius: 4px;
				border: 1px solid var(--color--border);

				h5 {
					margin: 0 0 1rem 0;
					color: var(--color--text);
					font-size: 1.1rem;
				}
			}

			.changes-summary {
				margin-top: 1rem;
				padding: 1rem;
				background: var(--color--callout-background);
				border-radius: 4px;
				border-left: 4px solid var(--color--accent);

				h6 {
					margin: 0 0 0.5rem 0;
					color: var(--color--text);
					font-size: 1rem;
				}

				p {
					margin: 0.25rem 0;
					color: var(--color--text);
					font-size: 0.9rem;
				}
			}
		}

		.no-pages,
		.no-chapters {
			margin-top: 1rem;
			padding: 1rem;
			background: var(--color--background-alt);
			border-radius: 4px;
			text-align: center;
			color: var(--color--text-muted);
		}

		.chapter-input {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			margin-bottom: 1rem;

			.chapter-pages-input {
				flex: 1;
			}
		}

		.pages-grid,
		.chapters-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 1rem;
		}

		.page-item,
		.page-preview,
		.chapter-item {
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

			.page-number,
			.chapter-name {
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
				right: 0.25rem;
				background: rgba(255, 0, 0, 0.8);
				color: white;
				padding: 0.25rem 0.5rem;
				border-radius: 4px;
				font-size: 0.75rem;
				display: flex;
				align-items: center;
				gap: 0.25rem;
				z-index: 10;

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

		.loading-preview {
			width: 100%;
			height: 150px;
			background: var(--color--background-alt);
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--color--text-muted);
			font-size: 0.875rem;
		}

		.no-pages-selected {
			text-align: center;
			padding: 2rem;
			color: var(--color--text-muted);
			font-style: italic;
		}

		.page-controls {
			position: absolute;
			top: 0.25rem;
			right: 0.25rem;
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			z-index: 5;
		}

		.drag-handle {
			position: absolute;
			top: 0.25rem;
			left: 0.25rem;
			background: rgba(0, 0, 0, 0.7);
			color: white;
			padding: 0.25rem 0.5rem;
			border-radius: 4px;
			font-size: 0.75rem;
			cursor: grab;
			user-select: none;

			&:active {
				cursor: grabbing;
			}
		}

		.page-item {
			&.dragging {
				opacity: 0.5;
				transform: rotate(5deg);
				z-index: 1000;
			}

			&.drag-over {
				border: 2px dashed var(--color--primary);
				transform: scale(1.05);
			}

			&.new-page {
				border: 2px solid var(--color--accent);

				.page-number {
					background: var(--color--accent);
				}
			}

			&.marked-for-deletion {
				opacity: 0.6;
				border: 2px solid var(--color--error);
				filter: grayscale(50%);

				.page-number {
					background: var(--color--error);
				}
			}
		}
	}
</style>
