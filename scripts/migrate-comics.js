import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ComicsService API calls
const API_BASE_URL = 'http://localhost:8080';

async function createComicInDatabase(comicData) {
    try {
        const response = await fetch(`${API_BASE_URL}/comics/createEntry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comicData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create comic');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating comic in database:', error);
        throw error;
    }
}

async function parseMarkdownFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Parse frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
            throw new Error('No frontmatter found');
        }

        const frontmatter = frontmatterMatch[1];
        const metadata = {};

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

        return metadata;
    } catch (error) {
        console.error('Error parsing markdown file:', error);
        throw error;
    }
}

async function migrateComics() {
    try {
        console.log('Starting comics migration...');

        // Path to comics directory
        const comicsDir = path.join(__dirname, '..', 'src', 'routes', '(comic)');

        // Get all comic directories
        const comicDirs = await fs.readdir(comicsDir);

        console.log(`Found ${comicDirs.length} comic directories`);

        for (const comicDir of comicDirs) {
            const markdownPath = path.join(comicsDir, comicDir, '+page.md');

            try {
                // Check if markdown file exists
                await fs.access(markdownPath);

                console.log(`Migrating comic: ${comicDir}`);

                // Parse the markdown file
                const metadata = await parseMarkdownFile(markdownPath);

                // Prepare data for database
                const comicData = {
                    title: metadata.title || comicDir,
                    coverImage: metadata.coverImage || `/images/comics/${comicDir}/SeriesCover.jpg`,
                    series: metadata.series || false,
                    description: metadata.description || '',
                    date: metadata.date || new Date().toISOString()
                };

                // Create in database
                const result = await createComicInDatabase(comicData);
                console.log(`✓ Successfully migrated: ${comicDir} -> ${result.slug}`);

            } catch (error) {
                console.error(`✗ Failed to migrate ${comicDir}:`, error.message);
            }
        }

        console.log('Comics migration completed!');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateComics();
}

export { migrateComics }; 