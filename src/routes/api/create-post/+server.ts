import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function POST({ request }) {
    const formData = await request.formData();
    const title = formData.get('title');
    const slug = formData.get('title');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const coverImage = formData.get('coverImage');
    const tags = formData.get('tags')?.toString().split(',').filter(Boolean) || [];

    if (!title || !slug || !excerpt || !content) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Create the post directory
        const postDir = path.join(process.cwd(), 'src', 'routes', '(blog-article)', slug.toString());
        await fs.mkdir(postDir, { recursive: true });

        // Format the cover image path if provided
        let formattedCoverImage = '';
        if (coverImage) {
            // If the image path doesn't start with /images/posts/, add it
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
excerpt: ${excerpt}
tags:
${tags.map(tag => `  - ${tag}`).join('\n')}
---

<script>
  import Callout from "$lib/components/molecules/Callout.svelte";
  import CodeBlock from "$lib/components/molecules/CodeBlock.svelte";
  import Image from "$lib/components/atoms/Image.svelte";
</script>

${content}`;

        await fs.writeFile(path.join(postDir, '+page.md'), markdownContent);

        return json({ success: true, slug });
    } catch (error) {
        console.error('Error creating post:', error);
        return json({ error: 'Failed to create post' }, { status: 500 });
    }
}