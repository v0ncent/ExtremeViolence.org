import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComicsService } from '$lib/services/comicsService';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const isSeries = formData.get('isSeries') === 'true';
		const coverImage = formData.get('coverImage') as File;
		const pages = formData.getAll('pages') as File[];

		if (!title || !description || !coverImage) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		try {
			// First, create the post in the database to get the post ID
			const postData = {
				title,
				coverImage: '', // Will be updated after we know the post ID
				series: isSeries,
				description
			};

			const result = await ComicsService.createPost(postData);
			if (!result.success) {
				throw new Error('Failed to create comic in database');
			}

			// Use the post ID (slug) for the directory name
			const postId = result.slug;
			const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', postId);
			await fs.mkdir(imagesDir, { recursive: true });

			// Handle cover image upload
			let coverImagePath = '';
			if (isSeries) {
				coverImagePath = `/images/comics/${postId}/SeriesCover.jpg`;
			} else {
				coverImagePath = `/images/comics/${postId}/1.jpg`;
			}

			// Upload the cover image
			const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
			await sharp(coverBuffer)
				.jpeg({ quality: 90 })
				.toFile(path.join(process.cwd(), 'static', coverImagePath.slice(1)));

			// Handle page uploads for short stories
			if (!isSeries && pages.length > 0) {
				for (let i = 0; i < pages.length; i++) {
					const page = pages[i];
					const pageNumber = i + 2; // Start from 2 since 1.jpg is the cover
					const pagePath = `/images/comics/${postId}/${pageNumber}.jpg`;
					const pageBuffer = Buffer.from(await page.arrayBuffer());

					await sharp(pageBuffer)
						.jpeg({ quality: 90 })
						.toFile(path.join(process.cwd(), 'static', pagePath.slice(1)));
				}
			}

			// Update the post with the correct cover image path
			await ComicsService.updatePost(postId, { coverImage: coverImagePath });

			return json({ success: true, slug: postId });
		} catch (error) {
			console.error('Error creating comic:', error);
			return json({ error: 'Failed to create comic' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error processing comic creation:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
