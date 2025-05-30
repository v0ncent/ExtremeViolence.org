import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
	const { slug } = params;
	const comicDir = path.join('static/images/comics', slug);

	let chapters: string[] = [];

	try {
		const files = fs.readdirSync(comicDir, { withFileTypes: true });
		chapters = files
			.filter((dirent) => dirent.isDirectory() && dirent.name.startsWith('chapter'))
			.map((dirent) => dirent.name)
			.sort(); // optional: sort chapters alphabetically
	} catch (error) {
		console.error('Error reading chapters:', error);
	}

	return json({ chapters });
}
