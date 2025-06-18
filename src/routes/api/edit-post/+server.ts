import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function PUT({ request }) {
    const formData = await request.formData();
    const slug = formData.get('slug');
    const title = formData.get('title');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const coverImage = formData.get('coverImage');
    const tags = formData.get('tags')?.toString().split(',').filter(Boolean) || [];

    if (!slug || !title || !excerpt || !content) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const postDir = path.join(process.cwd(), 'src', 'routes', '(blog-article)', slug.toString());

        // Check if directory exists
        try {
            await fs.access(postDir);
        } catch {
            return json({ error: 'Post not found' }, { status: 404 });
        }

        // Format the cover image path if provided
        let formattedCoverImage = '';
        if (coverImage) {
            formattedCoverImage = coverImage.toString().startsWith('/images/posts/')
                ? coverImage.toString()
                : `/images/posts/${coverImage.toString()}`;
        }

        // Create the markdown file with frontmatter and required script section
        const markdownContent = `---
title: ${title}
slug: ${slug}
coverImage: ${formattedCoverImage}
date: ${new Date().toISOString()}
updated: ${new Date().toISOString()}
excerpt: ${excerpt}
tags:
${tags.map((tag) => `  - ${tag}`).join('\n')}
---

<script>
  import Callout from "$lib/components/molecules/Callout.svelte";
  import CodeBlock from "$lib/components/molecules/CodeBlock.svelte";
  import Image from "$lib/components/atoms/Image.svelte";
</script>

${content}`;

        await fs.writeFile(path.join(postDir, '+page.md'), markdownContent);

        return json({
            success: true,
            slug
        });
    } catch (error) {
        console.error('Error editing post:', error);
        return json({ error: 'Failed to edit post' }, { status: 500 });
    }
}