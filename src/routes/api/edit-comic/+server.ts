import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function PUT({ request }) {
    const formData = await request.formData();
    const currentSlug = formData.get('slug');
    const title = formData.get('title');
    const description = formData.get('description');
    const isSeries = formData.get('isSeries') === 'true';

    // Handle cover image (could be a file or existing path)
    const coverImageData = formData.get('coverImage');
    let coverImage: File | string | null = null;

    if (coverImageData instanceof File) {
        coverImage = coverImageData;
    } else if (coverImageData) {
        coverImage = coverImageData as string;
    }

    // Handle new pages for short stories
    const newPages = formData.getAll('newPages') as File[];

    // Handle pages to delete for short stories
    const pagesToDeleteData = formData.get('pagesToDelete');
    let pagesToDelete: string[] = [];
    if (pagesToDeleteData) {
        try {
            pagesToDelete = JSON.parse(pagesToDeleteData as string);
        } catch {
            pagesToDelete = [];
        }
    }

    // Handle new chapter for series
    const newChapterName = formData.get('newChapterName') as string;
    const newChapterPages = formData.getAll('newChapterPages') as File[];

    // Handle chapters to delete for series
    const chaptersToDeleteData = formData.get('chaptersToDelete');
    let chaptersToDelete: string[] = [];
    if (chaptersToDeleteData) {
        try {
            chaptersToDelete = JSON.parse(chaptersToDeleteData as string);
        } catch {
            chaptersToDelete = [];
        }
    }

    if (!currentSlug || !title || !description) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const currentPostDir = path.join(process.cwd(), 'src', 'routes', '(comic)', currentSlug.toString());
        const markdownPath = path.join(currentPostDir, '+page.md');

        // Check if the current comic exists
        try {
            await fs.access(markdownPath);
        } catch {
            return json({ error: 'Comic not found' }, { status: 404 });
        }

        // Read the existing markdown file
        const existingContent = await fs.readFile(markdownPath, 'utf-8');

        // Parse the frontmatter to preserve existing tags and other fields
        const frontmatterMatch = existingContent.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
            return json({ error: 'Invalid markdown file format' }, { status: 400 });
        }

        const frontmatter = frontmatterMatch[1];

        // Extract existing tags
        const tagsMatch = frontmatter.match(/tags:\n((?:\s*-\s*[^\n]+\n?)*)/);
        const tags = tagsMatch ? tagsMatch[1] : '';

        // Extract existing cover image path
        const coverImageMatch = frontmatter.match(/coverImage:\s*(.+)/);
        const existingCoverImage = coverImageMatch ? coverImageMatch[1].trim() : '';

        // Generate new slug from title
        let newSlug = title.toString().replace(/ /g, '-').toLowerCase();

        // Check if the new slug would conflict with existing comics (excluding current one)
        const comicDir = path.join(process.cwd(), 'src', 'routes', '(comic)');
        const existingDirs = await fs.readdir(comicDir);
        let uniqueSlug = newSlug;
        let counter = 1;

        while (existingDirs.includes(uniqueSlug) && uniqueSlug !== currentSlug) {
            uniqueSlug = `${newSlug}-${counter}`;
            counter++;
        }
        newSlug = uniqueSlug;

        // Handle cover image
        let coverImagePath = '';
        if (coverImage instanceof File) {
            // New image uploaded
            if (isSeries) {
                coverImagePath = `/images/comics/${newSlug}/SeriesCover.jpg`;
            } else {
                coverImagePath = `/images/comics/${newSlug}/1.jpg`;
            }

            const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
            await sharp(coverBuffer)
                .jpeg({ quality: 90 })
                .toFile(path.join(process.cwd(), 'static', coverImagePath.slice(1)));
        } else if (coverImage && typeof coverImage === 'string') {
            // Use provided cover image path, but update it for new slug if needed
            if (newSlug !== currentSlug) {
                if (isSeries) {
                    coverImagePath = `/images/comics/${newSlug}/SeriesCover.jpg`;
                } else {
                    coverImagePath = `/images/comics/${newSlug}/1.jpg`;
                }
            } else {
                coverImagePath = coverImage;
            }
        } else {
            // No new cover image provided, use existing one
            if (existingCoverImage) {
                if (newSlug !== currentSlug) {
                    // Update path for new slug
                    if (isSeries) {
                        coverImagePath = `/images/comics/${newSlug}/SeriesCover.jpg`;
                    } else {
                        coverImagePath = `/images/comics/${newSlug}/1.jpg`;
                    }
                } else {
                    coverImagePath = existingCoverImage;
                }
            } else {
                // Fallback if no existing cover image
                if (isSeries) {
                    coverImagePath = `/images/comics/${newSlug}/SeriesCover.jpg`;
                } else {
                    coverImagePath = `/images/comics/${newSlug}/1.jpg`;
                }
            }
        }

        // Handle directory renaming if slug changed
        if (newSlug !== currentSlug) {
            const newPostDir = path.join(process.cwd(), 'src', 'routes', '(comic)', newSlug);

            // Rename the directory
            await fs.rename(currentPostDir, newPostDir);

            // Rename the images directory
            const currentImagesDir = path.join(process.cwd(), 'static', 'images', 'comics', currentSlug.toString());
            const newImagesDir = path.join(process.cwd(), 'static', 'images', 'comics', newSlug);

            try {
                await fs.rename(currentImagesDir, newImagesDir);
            } catch (error) {
                // If images directory doesn't exist, create it
                await fs.mkdir(newImagesDir, { recursive: true });
            }
        }

        // Handle page management for short stories
        if (!isSeries) {
            const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', newSlug);

            // Delete selected pages
            for (const pageNumber of pagesToDelete) {
                const pagePath = path.join(imagesDir, `${pageNumber}.jpg`);
                try {
                    await fs.unlink(pagePath);
                } catch (error) {
                    console.log(`Page ${pageNumber}.jpg not found, skipping deletion`);
                }
            }

            // Add new pages
            if (newPages.length > 0) {
                // Get the next available page number
                const existingFiles = await fs.readdir(imagesDir);
                const existingPages = existingFiles
                    .filter(file => /^\d+\.jpg$/.test(file))
                    .map(file => parseInt(file.replace('.jpg', '')))
                    .sort((a, b) => a - b);

                const nextPageNumber = existingPages.length > 0 ? Math.max(...existingPages) + 1 : 1;

                for (let i = 0; i < newPages.length; i++) {
                    const page = newPages[i];
                    const pageNumber = nextPageNumber + i;
                    const pagePath = `/images/comics/${newSlug}/${pageNumber}.jpg`;
                    const pageBuffer = Buffer.from(await page.arrayBuffer());

                    await sharp(pageBuffer)
                        .jpeg({ quality: 90 })
                        .toFile(path.join(process.cwd(), 'static', pagePath.slice(1)));
                }
            }
        } else {
            // Handle chapter management for series
            const imagesDir = path.join(process.cwd(), 'static', 'images', 'comics', newSlug);

            // Delete selected chapters
            for (const chapterName of chaptersToDelete) {
                const chapterDir = path.join(imagesDir, chapterName);
                try {
                    await fs.rm(chapterDir, { recursive: true, force: true });
                } catch (error) {
                    console.log(`Chapter ${chapterName} not found, skipping deletion`);
                }
            }

            // Add new chapter
            if (newChapterName && newChapterPages.length > 0) {
                const chapterDir = path.join(imagesDir, newChapterName);
                await fs.mkdir(chapterDir, { recursive: true });

                for (let i = 0; i < newChapterPages.length; i++) {
                    const page = newChapterPages[i];
                    const pageNumber = i + 1;
                    const pagePath = `/images/comics/${newSlug}/${newChapterName}/${pageNumber}.jpg`;
                    const pageBuffer = Buffer.from(await page.arrayBuffer());

                    await sharp(pageBuffer)
                        .jpeg({ quality: 90 })
                        .toFile(path.join(process.cwd(), 'static', pagePath.slice(1)));
                }
            }
        }

        // Create the new markdown content
        const newMarkdownContent = `---
title: ${title}
slug: ${newSlug}
coverImage: ${coverImagePath}
date: ${new Date().toISOString()}
excerpt: Comics
series: ${isSeries}
description: ${description}
tags:
${tags}
---
`;

        // Write the markdown file
        const finalPostDir = newSlug !== currentSlug
            ? path.join(process.cwd(), 'src', 'routes', '(comic)', newSlug)
            : currentPostDir;
        await fs.writeFile(path.join(finalPostDir, '+page.md'), newMarkdownContent);

        return json({
            success: true,
            slug: newSlug,
            shouldRefresh: true
        });
    } catch (error) {
        console.error('Error editing comic:', error);
        return json({ error: 'Failed to edit comic' }, { status: 500 });
    }
}
