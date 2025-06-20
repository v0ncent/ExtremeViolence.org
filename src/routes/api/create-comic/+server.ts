import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST({ request }) {
	const formData = await request.formData();
	const title = formData.get('title');
	let slug = formData.get('title')?.toString().replace(/ /g, '-').toLowerCase();
	const excerpt = 'Comics';
	const description = formData.get('description');
	const isSeries = formData.get('isSeries') === 'true';
	const tags = formData.get('tags')?.toString().split(',').filter(Boolean) || [];

	// Handle file uploads
	const coverImage = formData.get('coverImage') as File;
	const pages = formData.getAll('pages') as File[];

	if (!title || !slug || !excerpt || !description || !coverImage) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		// Check for existing slugs and generate a unique one if needed
		const comicDir = path.join(process.cwd(), 'src', 'routes', '(comic)');
		const existingDirs = await fs.readdir(comicDir);
		let uniqueSlug = slug;
		let counter = 1;

		while (existingDirs.includes(uniqueSlug)) {
			uniqueSlug = `${slug}-${counter}`;
			counter++;
		}
		slug = uniqueSlug;

		// Create the post directory
		const postDir = path.join(process.cwd(), 'src', 'routes', '(comic)', slug);
		await fs.mkdir(postDir, { recursive: true });

		// Create the images directory structure
		const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', slug);
		await fs.mkdir(imagesDir, { recursive: true });

		// Handle cover image upload
		let coverImagePath = '';
		if (isSeries) {
			coverImagePath = `/images/comics/${slug}/SeriesCover.jpg`;
			const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
			await sharp(coverBuffer)
				.jpeg({ quality: 90 })
				.toFile(path.join(process.cwd(), 'static', coverImagePath.slice(1)));
		} else {
			coverImagePath = `/images/comics/${slug}/1.jpg`;
			const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
			await sharp(coverBuffer)
				.jpeg({ quality: 90 })
				.toFile(path.join(process.cwd(), 'static', coverImagePath.slice(1)));
		}

		// Handle page uploads for short stories
		if (!isSeries && pages.length > 0) {
			for (let i = 0; i < pages.length; i++) {
				const page = pages[i];
				const pageNumber = i + 1;
				const pagePath = `/images/comics/${slug}/${pageNumber}.jpg`;
				const pageBuffer = Buffer.from(await page.arrayBuffer());

				await sharp(pageBuffer)
					.jpeg({ quality: 90 })
					.toFile(path.join(process.cwd(), 'static', pagePath.slice(1)));
			}
		}

		// Create the markdown file with frontmatter
		const markdownContent = `---
title: ${title}
slug: ${slug}
coverImage: ${coverImagePath}
date: ${new Date().toISOString()}
excerpt: ${excerpt}
series: ${isSeries}
description: ${description}
tags:
${tags.map((tag) => `  - ${tag}`).join('\n')}
---
`;

		await fs.writeFile(path.join(postDir, '+page.md'), markdownContent);

		// Return success with the slug and a flag to trigger refresh
		return json({
			success: true,
			slug,
			shouldRefresh: true
		});
	} catch (error) {
		console.error('Error creating comic:', error);
		return json({ error: 'Failed to create comic' }, { status: 500 });
	}
}
