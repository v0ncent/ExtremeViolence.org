import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function PUT({ request }) {
	const formData = await request.formData();
	const slug = formData.get('slug');
	const title = formData.get('title');
	const coverImage = formData.get('coverImage');

	if (!slug || !title) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		const postDir = path.join(process.cwd(), 'src', 'routes', '(gallery)', slug.toString());

		// Check if directory exists
		try {
			await fs.access(postDir);
		} catch {
			return json({ error: 'Post not found' }, { status: 404 });
		}

		// Read the existing file to get the current cover image
		const existingFilePath = path.join(postDir, '+page.md');
		let existingCoverImage = '';

		try {
			const existingContent = await fs.readFile(existingFilePath, 'utf-8');
			const coverImageMatch = existingContent.match(/coverImage: (.*)/);
			if (coverImageMatch) {
				existingCoverImage = coverImageMatch[1].trim();
			}
		} catch (error) {
			console.error('Error reading existing file:', error);
		}

		// Use the new cover image if provided, otherwise keep the existing one
		const formattedCoverImage =
			coverImage && coverImage.toString().trim() !== ''
				? coverImage.toString().startsWith('/images/gallery/')
					? coverImage.toString()
					: `/images/gallery/${coverImage.toString()}`
				: existingCoverImage;

		// Get image dimensions if we have a cover image
		let imageWidth = '';
		let imageHeight = '';
		if (formattedCoverImage) {
			const imagePath = path.join(process.cwd(), 'static', formattedCoverImage.slice(1));
			const metadata = await sharp(imagePath).metadata();
			if (metadata.width && metadata.height) {
				imageWidth = metadata.width.toString();
				imageHeight = metadata.height.toString();
			}
		}

		// Create the markdown file with frontmatter
		const markdownContent = `---
title: ${title}
slug: ${slug}
coverImage: ${formattedCoverImage}
date: ${new Date().toISOString()}
updated: ${new Date().toISOString()}
width: ${imageWidth}
height: ${imageHeight}
---

<script>
  import Image from "$lib/components/atoms/Image.svelte";
</script>`;

		await fs.writeFile(existingFilePath, markdownContent);

		return json({
			success: true,
			slug
		});
	} catch (error) {
		console.error('Error editing post:', error);
		return json({ error: 'Failed to edit post' }, { status: 500 });
	}
}
