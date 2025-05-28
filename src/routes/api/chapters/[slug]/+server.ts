import fs from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;
	const imagePath = path.resolve(`static/images/comics/${slug}`);
	let chapters: string[] = [];

	try {
		const entries = fs.readdirSync(imagePath, { withFileTypes: true });
		chapters = entries
			.filter((entry) => entry.isDirectory() && entry.name.toLowerCase().startsWith('chapter'))
			.map((entry) => entry.name);
	} catch (err) {
		console.error(err);
	}

	return new Response(JSON.stringify(chapters), {
		headers: { 'Content-Type': 'application/json' }
	});
};
