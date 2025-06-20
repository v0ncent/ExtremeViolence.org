import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { slug } = params;

		if (!slug) {
			return json({ error: 'Comic slug is required' }, { status: 400 });
		}

		// Path to the comic's markdown file
		const comicPath = join(process.cwd(), 'src', 'routes', '(comic)', slug, '+page.md');

		try {
			const fileContent = readFileSync(comicPath, 'utf-8');

			// Parse frontmatter (simple parsing for now)
			const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);

			if (frontmatterMatch) {
				const frontmatter = frontmatterMatch[1];
				const metadata: Record<string, any> = {};

				// Parse each line of frontmatter
				frontmatter.split('\n').forEach((line) => {
					const colonIndex = line.indexOf(':');
					if (colonIndex > 0) {
						const key = line.substring(0, colonIndex).trim();
						const value = line.substring(colonIndex + 1).trim();

						// Handle different value types
						if (value.startsWith('[') && value.endsWith(']')) {
							// Array
							metadata[key] = value
								.slice(1, -1)
								.split(',')
								.map((item) => item.trim());
						} else if (value === 'true' || value === 'false') {
							// Boolean
							metadata[key] = value === 'true';
						} else if (!isNaN(Number(value))) {
							// Number
							metadata[key] = Number(value);
						} else {
							// String (remove quotes if present)
							metadata[key] = value.replace(/^["']|["']$/g, '');
						}
					}
				});

				return json(metadata);
			}
		} catch (fileError) {
			console.error('Error reading comic file:', fileError);
		}

		return json({ error: 'Comic not found' }, { status: 404 });
	} catch (error) {
		console.error('Error in comics API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
