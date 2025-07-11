import type {
    NewsContentModel,
    PostComment,
    UserContentModel,
    UserContentComment
} from '$lib/utils/types';

const API_BASE_URL = 'http://localhost:8080';

export class NewsService {
    // Get all news posts
    static async getAllPosts(): Promise<NewsContentModel[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/news/getall`);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const posts = await response.json();
            if (!Array.isArray(posts)) {
                console.error('API returned non-array data:', posts);
                return [];
            }
            return posts;
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    }

    // Get a single post by slug
    static async getPostBySlug(slug: string): Promise<NewsContentModel | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/news/get/slug/${slug}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching post by slug:', error);
            return null;
        }
    }

    // Get a single post by postId
    static async getPostById(postId: string): Promise<NewsContentModel | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/news/get/postId/${postId}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    }

    // Create a new post
    static async createPost(postData: Omit<NewsContentModel, 'id' | 'postId' | 'date' | 'comments' | 'slug'>): Promise<{ success: boolean; slug: string; postId: string }> {
        try {
            const postId = crypto.randomUUID();
            const date = new Date().toISOString();
            const fullPostData: NewsContentModel = {
                ...postData,
                id: postId,
                slug: postId,
                postId,
                date,
                comments: [],
                excerpt: '',
                tags: '',
                html: postData.html || ''
            };
            const response = await fetch(`${API_BASE_URL}/news/createEntry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullPostData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }
            return { success: true, slug: postId, postId };
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    // Update a post
    static async updatePost(slug: string, updates: Partial<NewsContentModel>): Promise<boolean> {
        try {
            const currentPost = await this.getPostBySlug(slug);
            if (!currentPost) throw new Error('Post not found');
            const updatedPost: NewsContentModel = {
                ...currentPost,
                ...updates,
                postId: currentPost.postId
            };
            const response = await fetch(`${API_BASE_URL}/news/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPost)
            });
            if (!response.ok) return false;
            return true;
        } catch (error) {
            console.error('Error updating post:', error);
            return false;
        }
    }

    // Delete a post
    static async deletePost(slug: string): Promise<boolean> {
        try {
            const post = await this.getPostBySlug(slug);
            if (!post) return false;
            const response = await fetch(`${API_BASE_URL}/news/delete/postId/${post.postId}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting post:', error);
            return false;
        }
    }

    // Add a comment to a post
    static async addComment(postId: string, userId: string, text: string): Promise<boolean> {
        try {
            const commentId = crypto.randomUUID();
            const date = new Date().toISOString();
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');
            const newComment: PostComment = { postId, userId, text, date };
            const updatedComments = [...post.comments, newComment];
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post with comment');
            // Also add to user content
            const userComment: UserContentComment = {
                commentId,
                postId,
                postTitle: post.title,
                section: 'news',
                text,
                date
            };
            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${userId}`);
            let userContent: UserContentModel;
            if (userContentResponse.ok) {
                userContent = await userContentResponse.json();
                userContent.comments = [...userContent.comments, userComment];
            } else {
                userContent = { id: userId, userId, comments: [userComment] };
            }
            const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/createEntry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userContent)
            });
            return userContentSaveResponse.ok;
        } catch (error) {
            console.error('Error adding comment:', error);
            return false;
        }
    }

    // Update a comment
    static async updateComment(postId: string, commentId: string, newText: string): Promise<boolean> {
        try {
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');
            const updatedComments = post.comments.map(comment =>
                comment.postId === postId && comment.date === commentId
                    ? { ...comment, text: newText }
                    : comment
            );
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post comment');
            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${post.comments.find(c => c.date === commentId)?.userId}`);
            if (userContentResponse.ok) {
                const userContent: UserContentModel = await userContentResponse.json();
                const updatedUserComments = userContent.comments.map(comment =>
                    comment.commentId === commentId
                        ? { ...comment, text: newText }
                        : comment
                );
                const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/createEntry`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...userContent, comments: updatedUserComments })
                });
                return userContentSaveResponse.ok;
            }
            return true;
        } catch (error) {
            console.error('Error updating comment:', error);
            return false;
        }
    }

    // Delete a comment
    static async deleteComment(postId: string, commentId: string): Promise<boolean> {
        try {
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');
            const commentToDelete = post.comments.find(c => c.date === commentId);
            if (!commentToDelete) throw new Error('Comment not found');
            const updatedComments = post.comments.filter(comment => comment.date !== commentId);
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post after comment deletion');
            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${commentToDelete.userId}`);
            if (userContentResponse.ok) {
                const userContent: UserContentModel = await userContentResponse.json();
                const updatedUserComments = userContent.comments.filter(comment => comment.commentId !== commentId);
                const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/createEntry`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...userContent, comments: updatedUserComments })
                });
                return userContentSaveResponse.ok;
            }
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    }
} 