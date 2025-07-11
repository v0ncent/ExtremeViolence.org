# Database Migration for News Posts

This document outlines the migration from static markdown files to a database-driven system for news blog posts.

## Overview

The news blog post system has been completely overhauled to use a MongoDB database instead of static markdown files. This provides better scalability, real-time updates, and easier content management.

## Architecture

### Backend (Spring Boot)

- **Database**: MongoDB
- **Models**:
  - `NewsContentModel` - Stores news post data
  - `UserContentModel` - Stores user comments and interactions
- **API Endpoints**:
  - `POST /news/createEntry` - Create new post
  - `GET /news/getall` - Get all posts
  - `GET /news/get/{field}/{value}` - Get post by criteria
  - `PUT /update` - Update post (with complete model in request body)
  - `DELETE /delete/{field}/{value}` - Delete post
  - `POST /userContent/createEntry` - Create/update user content

### Frontend (SvelteKit)

- **Service**: `NewsService` - Handles all database operations
- **Routes**: Dynamic routes using `[slug]` for individual posts
- **Components**: Updated to work with database data structure

## Data Models

### NewsContentModel

```typescript
interface NewsPost {
	id: string;
	title: string;
	slug: string;
	coverImage: string;
	date: string;
	postId: string;
	comments: PostComment[];
	html: string;
	excerpt?: string;
	tags?: string;
}
```

### PostComment

```typescript
interface PostComment {
	postId: string;
	userId: string;
	text: string;
	date: string;
}
```

### UserContent

```typescript
interface UserContent {
	userId: string;
	comments: UserComment[];
}

interface UserComment {
	commentId: string;
	postId: string;
	postTitle: string;
	section: string;
	text: string;
	date: string;
}
```

## Key Changes

### 1. Post Creation

- **Before**: Created markdown files in `src/routes/(blog-article)/{slug}/+page.md`
- **After**: Posts are stored in MongoDB via Spring Boot API

### 2. Post Rendering

- **Before**: Static markdown files with frontmatter
- **After**: Dynamic routes `[slug]` that fetch from database

### 3. Comments System

- **Before**: Comments were stored locally
- **After**: Comments are stored in both news posts and user content collections

### 4. ID and Date Consistency

- **IDs**: All IDs (postId, commentId) now use `crypto.randomUUID()` format like userIds
- **Dates**: All dates use ISO format: `2023-04-22T20:45:25.350Z`

### 5. File Structure Changes

```
Removed:
- src/routes/(blog-article)/+layout.server.ts
- All individual post directories and +page.md files (Bruh-News-Posting, bruh, another-post*, penis)

Added:
- src/routes/(blog-article)/[slug]/+page.server.ts
- src/routes/(blog-article)/[slug]/+page.svelte
- src/lib/services/newsService.ts
- src/routes/api/comments/+server.ts
```

## API Integration

### Creating Posts

```typescript
const result = await NewsService.createPost({
	title: 'Post Title',
	slug: 'post-title',
	coverImage: '/images/posts/image.jpg',
	html: '<h1>Content</h1>',
	excerpt: 'Post excerpt',
	tags: 'tag1,tag2,tag3'
});
```

### Fetching Posts

```typescript
// Get all posts
const posts = await NewsService.getAllPosts();

// Get specific post
const post = await NewsService.getPostBySlug('post-slug');
```

### Managing Comments

```typescript
// Add comment
await NewsService.addComment(postId, userId, commentText);

// Update comment
await NewsService.updateComment(postId, commentId, newText);

// Delete comment
await NewsService.deleteComment(postId, commentId);
```

## Migration Steps

1. **Database Setup**: Ensure MongoDB is running and Spring Boot backend is accessible
2. **API Testing**: Use the provided test script to verify database connectivity
3. **Content Migration**: Existing markdown posts can be migrated by:
   - Reading the markdown files
   - Converting to the new data structure
   - Posting to the database via API

## Benefits

1. **Scalability**: No file system limitations
2. **Real-time Updates**: Changes reflect immediately
3. **Better Performance**: Database queries are faster than file system operations
4. **Data Integrity**: ACID compliance and better data consistency
5. **Easier Management**: Centralized content management
6. **User Interactions**: Better comment system with user tracking

## Testing

Run the test script to verify the system:

```bash
node test-database.js
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure Spring Boot backend is running on `localhost:8080`
2. **CORS Issues**: Backend should allow requests from frontend origin
3. **Data Format**: Ensure all required fields are present in API requests
4. **Unique IDs**: Post IDs and comment IDs must be unique across the system

### Error Handling

The system includes comprehensive error handling:

- Network errors are caught and logged
- Database errors return appropriate HTTP status codes
- Frontend displays user-friendly error messages

## Future Enhancements

1. **Search Functionality**: Full-text search across posts
2. **Caching**: Redis caching for better performance
3. **Analytics**: Track post views and user engagement
4. **Media Management**: Better image and file handling
5. **SEO Optimization**: Dynamic meta tags and structured data
