# Comics Section Migration Guide

## Overview

The comics section has been migrated from a local markdown-based system to a database-driven system using MongoDB. This migration follows the same pattern as the news and gallery sections.

## Changes Made

### 1. Database Model

The comics now use the `ComicsContentModel` which extends `ContentModel` with additional fields:
- `series: boolean` - Indicates if the comic is a series or one-shot
- `description: string` - Description of the comic

### 2. New Service Layer

Created `ComicsService` (`src/lib/services/comicsService.ts`) with full CRUD operations:
- `getAllPosts()` - Get all comics
- `getPostBySlug(slug)` - Get comic by slug
- `getPostById(postId)` - Get comic by ID
- `createPost(postData)` - Create new comic
- `updatePost(slug, updates)` - Update existing comic
- `deletePost(slug)` - Delete comic
- Full comment management (add, update, delete, admin functions)

### 3. Updated Routes

All comic routes now use the database instead of local markdown files:
- `src/routes/(waves)/comics/+page.server.ts` - Main comics page
- `src/routes/(comic)/+layout.server.ts` - Individual comic layout
- `src/routes/(admin)/edit-comic/[slug]/+page.server.ts` - Edit comic page

### 4. Updated Components

Components updated to use `ComicsContentModel`:
- `ComicsSection.svelte`
- `LatestComics.svelte`
- Comic layout and edit pages

### 5. API Endpoints

Updated API endpoints to use the database:
- `/api/create-comic` - Create new comic
- `/api/edit-comic` - Edit existing comic
- `/api/delete-comic` - Delete comic

### 6. URL Routing Fixes

Fixed URL routing issues:
- Comics now properly route to `/comic/slug` instead of incorrect paths
- Comic viewer supports both series and one-shot formats
- Proper slug extraction from URLs

## Migration Process

### 1. Run the Migration Script

To migrate existing comics from markdown files to the database:

```bash
node scripts/migrate-comics.js
```

This script will:
- Read all existing markdown files in `src/routes/(comic)/`
- Parse the frontmatter metadata
- Create corresponding entries in the database
- Preserve all existing data (title, description, series status, etc.)

### 2. Verify Migration

After running the migration:
1. Check that all comics appear in the `/comics` page
2. Verify individual comic pages load correctly
3. Test admin functions (create, edit, delete)
4. Ensure comic viewer works for both series and one-shots

### 3. Clean Up (Optional)

Once migration is verified and working:
1. Backup the old markdown files
2. Remove the old `src/routes/(comic)/` directories
3. Update any remaining references to the old system

## Database Schema

The comics collection in MongoDB follows this structure:

```javascript
{
  id: "uuid",                    // Generated UUID
  title: "string",              // Comic title
  slug: "string",               // URL slug (auto-generated)
  coverImage: "string",         // Path to cover image
  date: "string",               // ISO date string
  comments: [],                 // Array of comments
  excerpt: "string",            // Always "Comics"
  tags: "string",               // Always "comics"
  series: boolean,              // Is this a series?
  description: "string"         // Comic description
}
```

## Benefits of Migration

1. **Consistency**: Comics now follow the same pattern as news and gallery
2. **Scalability**: Database-driven approach handles larger datasets better
3. **Performance**: Faster loading and better caching
4. **Maintainability**: Centralized data management
5. **Features**: Full comment system and admin functions
6. **URL Fixes**: Proper routing and slug handling

## Backend Requirements

Ensure your Spring Boot backend has the `ComicsContentModel` and corresponding endpoints:

- `GET /comics/getall` - Get all comics
- `GET /comics/get/slug/{slug}` - Get comic by slug
- `GET /comics/get/postId/{postId}` - Get comic by ID
- `POST /comics/createEntry` - Create comic
- `PUT /comics/update` - Update comic
- `DELETE /comics/delete/id/{id}` - Delete comic

## Troubleshooting

### Common Issues

1. **Comics not loading**: Check that the backend API is running and accessible
2. **Migration errors**: Ensure the backend is running before running the migration script
3. **URL routing issues**: Clear browser cache and restart the dev server
4. **Image paths**: Verify that comic images are in the correct `static/images/comics/` directory

### Rollback Plan

If issues arise, you can rollback by:
1. Restoring the old markdown files
2. Reverting the route changes
3. Removing the ComicsService references
4. Restoring the old data loading methods

## Future Enhancements

With the database system in place, future enhancements could include:
- Comic ratings and reviews
- Reading progress tracking
- Advanced search and filtering
- Comic recommendations
- Analytics and statistics 