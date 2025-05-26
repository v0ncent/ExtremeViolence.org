// src/routes/(comic)/[slug]/+page.server.ts
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	const mdPath = path.resolve('src/lib/comics', slug, 'page.md');

	if (!fs.existsSync(mdPath)) {
		throw error(404, `Comic not found: ${slug}`);
	}

	const file = fs.readFileSync(mdPath, 'utf-8');
	const { data, content } = matter(file);

	return {
		slug,
		title: data.title,
		coverImage: data.coverImage,
		date: data.date,
		excerpt: data.excerpt,
		tags: data.tags ?? [],
		content
	};
};
