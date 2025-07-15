import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComicsService } from '$lib/services/comicsService';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const slug = formData.get('slug') as string;
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const isSeries = formData.get('isSeries') === 'true';
		const newCoverImage = formData.get('newCoverImage') as File | null;
		const newPages = formData.getAll('newPages') as File[];
		const pagesToDelete = formData.getAll('pagesToDelete') as string[];
		const pageOrder = formData.getAll('pageOrder') as string[];
		const chaptersToDelete = formData.getAll('chaptersToDelete') as string[];

		// Handle new chapters for series
		const newChaptersData: { [chapterName: string]: File[] } = {};
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('newChapters_')) {
				const chapterName = key.replace('newChapters_', '');
				if (!newChaptersData[chapterName]) {
					newChaptersData[chapterName] = [];
				}
				newChaptersData[chapterName].push(value as File);
			}
		}

		// Handle chapter page deletions
		const chapterPagesToDelete: { [chapterName: string]: number[] } = {};
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('chapterPagesToDelete_')) {
				const chapterName = key.replace('chapterPagesToDelete_', '');
				if (!chapterPagesToDelete[chapterName]) {
					chapterPagesToDelete[chapterName] = [];
				}
				chapterPagesToDelete[chapterName].push(parseInt(value as string));
			}
		}

		// Handle chapter page reordering
		const chapterPageOrders: { [chapterName: string]: string[] } = {};
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('chapterPageOrder_')) {
				const chapterName = key.replace('chapterPageOrder_', '');
				if (!chapterPageOrders[chapterName]) {
					chapterPageOrders[chapterName] = [];
				}
				chapterPageOrders[chapterName].push(value as string);
			}
		}

		if (!slug || !title || !description) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		try {
			// Get the current post
			const currentPost = await ComicsService.getPostBySlug(slug);
			if (!currentPost) {
				return json({ error: 'Comic not found' }, { status: 404 });
			}

			// Prepare update data
			const updateData: any = {
				title,
				description,
				series: isSeries
			};

			// Handle new cover image if provided
			if (newCoverImage) {
				const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', slug);
				await fs.mkdir(imagesDir, { recursive: true });

				let coverImagePath = '';
				if (isSeries) {
					coverImagePath = `/images/comics/${slug}/SeriesCover.jpg`;
				} else {
					coverImagePath = `/images/comics/${slug}/1.jpg`;
				}

				const coverBuffer = Buffer.from(await newCoverImage.arrayBuffer());
				await sharp(coverBuffer)
					.jpeg({ quality: 90 })
					.toFile(path.join(process.cwd(), 'static', coverImagePath.slice(1)));

				updateData.coverImage = coverImagePath;
			}

			// Handle page deletion for short stories
			if (!isSeries && pagesToDelete.length > 0) {
				for (const pageNumberStr of pagesToDelete) {
					const pageNumber = parseInt(pageNumberStr);
					const pagePath = path.join(process.cwd(), 'static', 'images', 'comics', slug, `${pageNumber}.jpg`);
					try {
						await fs.unlink(pagePath);
					} catch (error) {
						// Page not found, skip deletion
					}
				}
			}

			// Handle page reordering for short stories
			if (!isSeries && pageOrder.length > 0) {
				const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', slug);

				// Parse page order: "pageNumber:newPosition"
				const orderMap = new Map();
				pageOrder.forEach(orderStr => {
					const [pageNumber, newPosition] = orderStr.split(':').map(Number);
					orderMap.set(pageNumber, newPosition);
				});

				// Rename files to match new order
				for (const [pageNumber, newPosition] of orderMap) {
					const oldPath = path.join(imagesDir, `${pageNumber}.jpg`);
					const tempPath = path.join(imagesDir, `temp_${newPosition}.jpg`);

					try {
						await fs.rename(oldPath, tempPath);
					} catch (error) {
						// Page not found, skip reorder
					}
				}

				// Rename temp files to final positions
				for (const [pageNumber, newPosition] of orderMap) {
					const tempPath = path.join(imagesDir, `temp_${newPosition}.jpg`);
					const newPath = path.join(imagesDir, `${newPosition}.jpg`);

					try {
						await fs.rename(tempPath, newPath);
					} catch (error) {
						// Temp file not found
					}
				}
			}

			// Handle new pages for short stories (add at the end)
			if (!isSeries && newPages.length > 0) {
				const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', slug);
				await fs.mkdir(imagesDir, { recursive: true });

				// Get the highest existing page number
				let maxPageNumber = 0;
				try {
					const files = await fs.readdir(imagesDir);
					const pageFiles = files.filter(file => /^\d+\.jpg$/.test(file));
					if (pageFiles.length > 0) {
						maxPageNumber = Math.max(...pageFiles.map(file => parseInt(file.replace('.jpg', ''))));
					}
				} catch (error) {
					// No existing pages found, starting from 1
				}

				// Add new pages starting after the highest existing page
				for (let i = 0; i < newPages.length; i++) {
					const page = newPages[i];
					const pageNumber = maxPageNumber + i + 1;
					const pagePath = `/images/comics/${slug}/${pageNumber}.jpg`;
					const pageBuffer = Buffer.from(await page.arrayBuffer());

					await sharp(pageBuffer)
						.jpeg({ quality: 90 })
						.toFile(path.join(process.cwd(), 'static', pagePath.slice(1)));
				}
			}

			// Handle new chapters for series
			if (isSeries && Object.keys(newChaptersData).length > 0) {
				const comicsDir = path.join(process.cwd(), 'static', 'images', 'comics', slug);
				await fs.mkdir(comicsDir, { recursive: true });

				for (const [chapterName, files] of Object.entries(newChaptersData)) {
					// Create chapter directory
					const chapterDir = path.join(comicsDir, chapterName);
					await fs.mkdir(chapterDir, { recursive: true });

					// Save chapter pages with sequential numbering (1.jpg, 2.jpg, etc.)
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						const pageNumber = i + 1;
						const pagePath = path.join(chapterDir, `${pageNumber}.jpg`);
						const pageBuffer = Buffer.from(await file.arrayBuffer());

						await sharp(pageBuffer)
							.jpeg({ quality: 90 })
							.toFile(pagePath);
					}

					// Created chapter with pages
				}
			}

			// Handle chapter page deletion for series
			if (isSeries && Object.keys(chapterPagesToDelete).length > 0) {
				for (const [chapterName, pageNumbers] of Object.entries(chapterPagesToDelete)) {
					const chapterDir = path.join(process.cwd(), 'static', 'images', 'comics', slug, chapterName);
					for (const pageNumber of pageNumbers) {
						const pagePath = path.join(chapterDir, `${pageNumber}.jpg`);
						try {
							await fs.unlink(pagePath);
						} catch (error) {
							// Page not found, skip deletion
						}
					}
				}
			}

			// Handle chapter page reordering for series
			if (isSeries && Object.keys(chapterPageOrders).length > 0) {
				for (const [chapterName, pageOrders] of Object.entries(chapterPageOrders)) {
					const chapterDir = path.join(process.cwd(), 'static', 'images', 'comics', slug, chapterName);

					// Parse page order: "pageNumber:newPosition"
					const orderMap = new Map();
					pageOrders.forEach(orderStr => {
						const [pageNumber, newPosition] = orderStr.split(':').map(Number);
						orderMap.set(pageNumber, newPosition);
					});

					// Rename files to match new order
					for (const [pageNumber, newPosition] of orderMap) {
						const oldPath = path.join(chapterDir, `${pageNumber}.jpg`);
						const tempPath = path.join(chapterDir, `temp_${newPosition}.jpg`);

						try {
							await fs.rename(oldPath, tempPath);
						} catch (error) {
							// Page not found, skip reorder
						}
					}

					// Rename temp files to final positions
					for (const [pageNumber, newPosition] of orderMap) {
						const tempPath = path.join(chapterDir, `temp_${newPosition}.jpg`);
						const newPath = path.join(chapterDir, `${newPosition}.jpg`);

						try {
							await fs.rename(tempPath, newPath);
						} catch (error) {
							// Temp file not found
						}
					}
				}
			}

			// Handle chapter deletion for series
			if (isSeries && chaptersToDelete.length > 0) {
				for (const chapter of chaptersToDelete) {
					const chapterDir = path.join(process.cwd(), 'static', 'images', 'comics', slug, chapter);
					try {
						await fs.rm(chapterDir, { recursive: true, force: true });
					} catch (error) {
						// Chapter directory not found, skip deletion
					}
				}
			}

			// Update the post in the database
			const success = await ComicsService.updatePost(slug, updateData);
			if (!success) {
				throw new Error('Failed to update comic in database');
			}

			return json({ success: true, slug });
		} catch (error) {
			console.error('Error updating comic:', error);
			return json({ error: 'Failed to update comic' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error processing comic update:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
