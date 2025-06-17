import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST({ request }) {
    const formData = await request.formData();
    const title = formData.get('title');
    const slug = formData.get('title')?.toString().replace(/ /g, '-');
    const excerpt = 'Gallery Post';
    const coverImage = formData.get('coverImage');
    const tags = formData.get('tags')?.toString().split(',').filter(Boolean) || [];

    if (!title || !slug || !excerpt || !coverImage) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Format the cover image path
        let formattedCoverImage = coverImage.toString().startsWith('/images/gallery/')
            ? coverImage.toString()
            : `/images/gallery/${coverImage.toString()}`;

        // Get image dimensions
        const imagePath = path.join(process.cwd(), 'static', formattedCoverImage.slice(1));
        const metadata = await sharp(imagePath).metadata();

        if (!metadata.width || !metadata.height) {
            return json({ error: 'Could not get image dimensions' }, { status: 400 });
        }

        // Create the post directory
        const postDir = path.join(process.cwd(), 'src', 'routes', '(gallery)', slug.toString());
        await fs.mkdir(postDir, { recursive: true });

        // Create the markdown file with frontmatter and required script section
        const markdownContent = `---
title: ${title}
slug: ${slug}
coverImage: ${formattedCoverImage}
date: ${new Date().toISOString()}
excerpt: ${excerpt}
width: ${metadata.width}
height: ${metadata.height}
tags:
${tags.map((tag) => `  - ${tag}`).join('\n')}
---

<script>
  import Callout from "$lib/components/molecules/Callout.svelte";
  import CodeBlock from "$lib/components/molecules/CodeBlock.svelte";
  import Image from "$lib/components/atoms/Image.svelte";
</script>
`;

        await fs.writeFile(path.join(postDir, '+page.md'), markdownContent);

        return json({ success: true, slug });
    } catch (error) {
        console.error('Error creating gallery post:', error);
        return json({ error: 'Failed to create gallery post' }, { status: 500 });
    }
}
