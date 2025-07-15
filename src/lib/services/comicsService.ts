import type {
    ComicsContentModel,
    ContentModelUpdate,
    PostComment,
    PostCommentRequest,
    UserContentModel,
    UserContentComment,
    UserContentAdminComment
} from '$lib/utils/types';

const API_BASE_URL = 'http://localhost:8080';

export class ComicsService {
    // Get all comic posts
    static async getAllPosts(): Promise<ComicsContentModel[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/comics/getall`);

            if (!response.ok) {
                console.error('Backend returned error status:', response.status);
                return [];
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
    static async getPostBySlug(slug: string): Promise<ComicsContentModel | null> {
        try {
            const url = `${API_BASE_URL}/comics/get/slug/${slug}`;
            const response = await fetch(url);
            if (!response.ok) {
                return null;
            }
            const post = await response.json();
            return post;
        } catch (error) {
            console.error('[getPostBySlug] Error fetching post by slug:', error);
            return null;
        }
    }

    // Get a single post by postId
    static async getPostById(postId: string): Promise<ComicsContentModel | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/comics/get/postId/${postId}`);
            if (!response.ok) return null;
            const post = await response.json();

            return post;
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    }

    // Create a new post
    static async createPost(postData: {
        title: string;
        coverImage: string;
        series: boolean;
        description: string;
    }): Promise<{ success: boolean; slug: string }> {
        try {
            const date = new Date().toISOString();
            const requestData = {
                title: postData.title,
                coverImage: postData.coverImage,
                series: postData.series,
                description: postData.description,
                date
            };

            const response = await fetch(`${API_BASE_URL}/comics/createEntry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }

            // Get the created post to get the generated slug/id
            const createdPost = await response.json();
            const slug = createdPost.slug;

            return { success: true, slug };
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    // Update a post
    static async updatePost(slug: string, updates: Partial<ContentModelUpdate>): Promise<boolean> {
        try {
            const currentPost = await this.getPostBySlug(slug);
            if (!currentPost) throw new Error('Post not found');
            const updatedPost: ContentModelUpdate = {
                ...currentPost,
                ...updates
            };
            const response = await fetch(`${API_BASE_URL}/comics/update`, {
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
            const response = await fetch(`${API_BASE_URL}/comics/delete/id/${post.id}`, {
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
            const date = new Date().toISOString();
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            // Filter out any existing comments with empty userId to prevent data corruption
            const validExistingComments = post.comments.filter((c) => c.userId && c.userId.trim() !== '');

            const newComment: PostCommentRequest = { userId, text, date };
            const updatedComments: PostCommentRequest[] = [
                ...validExistingComments.map((c) => ({
                    userId: c.userId,
                    text: c.text,
                    date: c.date,
                    adminComments: c.adminComments || [] // Preserve admin comments
                })),
                newComment
            ];

            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post with comment');

            // Get the updated post to get the generated commentId
            const updatedPost = await this.getPostById(postId);
            if (!updatedPost) throw new Error('Failed to get updated post');

            // Find the newly added comment to get its generated commentId
            const newCommentWithId = updatedPost.comments.find(
                (c) => c.userId === userId && c.text === text && c.date === date
            );

            if (!newCommentWithId) throw new Error('Failed to find newly added comment');

            // Also add to user content with the correct commentId
            const userComment: UserContentComment = {
                commentId: newCommentWithId.commentId,
                postId: post.id,
                postTitle: post.title,
                section: 'comics',
                text,
                date
            };

            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${userId}`);
            let userContent: UserContentModel;
            let isNewUserContent = false;

            if (userContentResponse.ok) {
                userContent = await userContentResponse.json();
                userContent.comments = [...userContent.comments, userComment];
            } else {
                userContent = { id: userId, userId, comments: [userComment], adminComments: [] };
                isNewUserContent = true;
            }

            // Use PUT for update, POST for create
            const userContentSaveResponse = await fetch(
                `${API_BASE_URL}/userContent/${isNewUserContent ? 'createEntry' : 'update'}`,
                {
                    method: isNewUserContent ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userContent)
                }
            );
            return userContentSaveResponse.ok;
        } catch (error) {
            console.error('Error adding comment:', error);
            return false;
        }
    }

    // Update a comment
    static async updateComment(postId: string, commentId: string, newText: string): Promise<boolean> {
        try {
            console.log('Updating comment with commentId:', commentId);
            // Get the post to find the comment and its author
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            // Find the comment to get the userId
            const commentToUpdate = post.comments.find((c) => c.commentId === commentId);
            if (!commentToUpdate) throw new Error('Comment not found');
            console.log('Found comment to update with userId:', commentToUpdate.userId);

            // Update the comment in the post's comments array - explicitly preserve all fields
            const updatedComments = post.comments.map((comment) =>
                comment.commentId === commentId
                    ? {
                        userId: comment.userId || commentToUpdate.userId, // Fallback to original userId if empty
                        commentId: comment.commentId,
                        text: newText,
                        date: new Date().toISOString()
                    }
                    : comment
            );

            // Update the post in the comics database
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post comment');

            // Update the comment in the user_content database

            if (!commentToUpdate.userId || commentToUpdate.userId.trim() === '') {
                console.error('Cannot update user_content: comment has empty userId');

                // Try to find the user_content by searching for the commentId
                const allUserContentResponse = await fetch(`${API_BASE_URL}/userContent/getall`);
                if (allUserContentResponse.ok) {
                    const allUserContent = await allUserContentResponse.json();
                    const userContentWithComment = allUserContent.find((uc: UserContentModel) =>
                        uc.comments.some((c) => c.commentId === commentId)
                    );

                    if (userContentWithComment) {
                        const updatedUserComments = userContentWithComment.comments.map((c) =>
                            c.commentId === commentId ? { ...c, text: newText, date: new Date().toISOString() } : c
                        );
                        userContentWithComment.comments = updatedUserComments;

                        const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(userContentWithComment)
                        });
                        return userContentUpdateResponse.ok;
                    }
                }
                return false;
            }

            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${commentToUpdate.userId}`);
            if (!userContentResponse.ok) {
                console.error('Failed to get user_content for userId:', commentToUpdate.userId);
                return false;
            }

            const userContent = await userContentResponse.json();
            const updatedUserComments = userContent.comments.map((c: UserContentComment) =>
                c.commentId === commentId ? { ...c, text: newText, date: new Date().toISOString() } : c
            );
            userContent.comments = updatedUserComments;

            const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userContent)
            });
            return userContentUpdateResponse.ok;
        } catch (error) {
            console.error('Error updating comment:', error);
            return false;
        }
    }

    // Delete a comment
    static async deleteComment(postId: string, commentId: string): Promise<boolean> {
        try {
            // Get the post to find the comment and its author
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            // Find the comment to get the userId
            const commentToDelete = post.comments.find((c) => c.commentId === commentId);
            if (!commentToDelete) throw new Error('Comment not found');

            // Remove the comment from the post's comments array
            const updatedComments = post.comments.filter((comment) => comment.commentId !== commentId);

            // Update the post in the comics database
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post comment');

            // Remove the comment from the user_content database

            if (!commentToDelete.userId || commentToDelete.userId.trim() === '') {
                console.error('Cannot delete from user_content: comment has empty userId');

                // Try to find the user_content by searching for the commentId
                const allUserContentResponse = await fetch(`${API_BASE_URL}/userContent/getall`);
                if (allUserContentResponse.ok) {
                    const allUserContent = await allUserContentResponse.json();
                    const userContentWithComment = allUserContent.find((uc: UserContentModel) =>
                        uc.comments.some((c) => c.commentId === commentId)
                    );

                    if (userContentWithComment) {
                        const updatedUserComments = userContentWithComment.comments.filter(
                            (c) => c.commentId !== commentId
                        );
                        userContentWithComment.comments = updatedUserComments;

                        const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(userContentWithComment)
                        });
                        return userContentUpdateResponse.ok;
                    }
                }
                return false;
            }

            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${commentToDelete.userId}`);
            if (!userContentResponse.ok) {
                console.error('Failed to get user_content for userId:', commentToDelete.userId);
                return false;
            }

            const userContent = await userContentResponse.json();
            const updatedUserComments = userContent.comments.filter((c: UserContentComment) => c.commentId !== commentId);
            userContent.comments = updatedUserComments;

            const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userContent)
            });
            return userContentUpdateResponse.ok;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    }

    // Admin force delete comment (marks as deleted by admin)
    static async adminForceDeleteComment(
        postId: string,
        commentId: string,
        adminUserId: string,
        adminUserName: string
    ): Promise<boolean> {
        try {
            // Get the post to find the comment and its author
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            // Find the comment to get the userId
            const commentToDelete = post.comments.find((c) => c.commentId === commentId);
            if (!commentToDelete) throw new Error('Comment not found');

            // Remove the comment from the post's comments array
            const updatedComments = post.comments.filter((comment) => comment.commentId !== commentId);

            // Update the post in the comics database
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post comment');

            // Mark the comment as deleted by admin in the user_content database

            if (!commentToDelete.userId || commentToDelete.userId.trim() === '') {
                console.error('Cannot mark comment as deleted: comment has empty userId');

                // Try to find the user_content by searching for the commentId
                const allUserContentResponse = await fetch(`${API_BASE_URL}/userContent/getall`);
                if (allUserContentResponse.ok) {
                    const allUserContent = await allUserContentResponse.json();
                    const userContentWithComment = allUserContent.find((uc: UserContentModel) =>
                        uc.comments.some((c) => c.commentId === commentId)
                    );

                    if (userContentWithComment) {
                        const updatedUserComments = userContentWithComment.comments.map((c) =>
                            c.commentId === commentId ? { ...c, deletedByAdmin: true } : c
                        );
                        userContentWithComment.comments = updatedUserComments;

                        const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(userContentWithComment)
                        });
                        return userContentUpdateResponse.ok;
                    }
                }
                return false;
            }

            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${commentToDelete.userId}`);
            if (!userContentResponse.ok) {
                console.error('Failed to get user_content for userId:', commentToDelete.userId);
                return false;
            }

            const userContent = await userContentResponse.json();
            const updatedUserComments = userContent.comments.map((c: UserContentComment) =>
                c.commentId === commentId ? { ...c, deletedByAdmin: true } : c
            );
            userContent.comments = updatedUserComments;

            const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userContent)
            });
            return userContentUpdateResponse.ok;
        } catch (error) {
            console.error('Error admin force deleting comment:', error);
            return false;
        }
    }

    // Add admin comment to a user comment
    static async addAdminComment(
        postId: string,
        commentId: string,
        adminCommentText: string,
        adminUserId: string,
        adminUserName: string
    ): Promise<boolean> {
        try {
            console.log('Adding admin comment to commentId:', commentId);
            const date = new Date().toISOString();
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            // Find the comment to add admin comment to
            const commentToUpdate = post.comments.find((c) => c.commentId === commentId);
            if (!commentToUpdate) throw new Error('Comment not found');

            // Create the admin comment
            const newAdminComment: PostAdminCommentRequest = {
                userId: adminUserId,
                onComment: commentId,
                text: adminCommentText,
                date
            };

            // Add the admin comment to the existing comment
            const updatedComments = post.comments.map((comment) =>
                comment.commentId === commentId
                    ? {
                        ...comment,
                        adminComments: [...(comment.adminComments || []), newAdminComment]
                    }
                    : comment
            );

            // Update the post in the comics database
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post with admin comment');

            // Get the updated post to get the generated admin commentId
            const updatedPost = await this.getPostById(postId);
            if (!updatedPost) throw new Error('Failed to get updated post');

            // Find the comment with the new admin comment to get its generated admin commentId
            const commentWithNewAdminComment = updatedPost.comments.find((c) => c.commentId === commentId);
            if (!commentWithNewAdminComment) throw new Error('Failed to find comment with new admin comment');

            const newAdminCommentWithId = commentWithNewAdminComment.adminComments?.find(
                (ac) => ac.userId === adminUserId && ac.text === adminCommentText && ac.date === date
            );

            if (!newAdminCommentWithId) throw new Error('Failed to find newly added admin comment');

            // Also add to user content with the correct admin commentId
            const userAdminComment: UserContentAdminComment = {
                commentId: newAdminCommentWithId.commentId,
                onComment: commentId,
                postId: post.id,
                postTitle: post.title,
                section: 'comics',
                text: adminCommentText,
                date
            };

            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${adminUserId}`);
            let userContent: UserContentModel;
            let isNewUserContent = false;

            if (userContentResponse.ok) {
                userContent = await userContentResponse.json();
                userContent.adminComments = [...userContent.adminComments, userAdminComment];
            } else {
                userContent = { id: adminUserId, userId: adminUserId, comments: [], adminComments: [userAdminComment] };
                isNewUserContent = true;
            }

            // Use PUT for update, POST for create
            const userContentSaveResponse = await fetch(
                `${API_BASE_URL}/userContent/${isNewUserContent ? 'createEntry' : 'update'}`,
                {
                    method: isNewUserContent ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userContent)
                }
            );
            return userContentSaveResponse.ok;
        } catch (error) {
            console.error('Error adding admin comment:', error);
            return false;
        }
    }

    // Delete admin comment
    static async deleteAdminComment(
        postId: string,
        commentId: string,
        adminCommentId: string
    ): Promise<boolean> {
        try {
            // Get the post to find the comment and its admin comment
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            // Find the comment to get the admin comment
            const commentToUpdate = post.comments.find((c) => c.commentId === commentId);
            if (!commentToUpdate) throw new Error('Comment not found');

            // Find the admin comment to get the userId
            const adminCommentToDelete = commentToUpdate.adminComments?.find((ac) => ac.commentId === adminCommentId);
            if (!adminCommentToDelete) throw new Error('Admin comment not found');

            // Remove the admin comment from the comment's admin comments array
            const updatedComments = post.comments.map((comment) =>
                comment.commentId === commentId
                    ? {
                        ...comment,
                        adminComments: comment.adminComments?.filter((ac) => ac.commentId !== adminCommentId) || []
                    }
                    : comment
            );

            // Update the post in the comics database
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post admin comment');

            // Remove the admin comment from the user_content database

            if (!adminCommentToDelete.userId || adminCommentToDelete.userId.trim() === '') {
                console.error('Cannot delete admin comment from user_content: admin comment has empty userId');

                // Try to find the user_content by searching for the adminCommentId
                const allUserContentResponse = await fetch(`${API_BASE_URL}/userContent/getall`);
                if (allUserContentResponse.ok) {
                    const allUserContent = await allUserContentResponse.json();
                    const userContentWithAdminComment = allUserContent.find((uc: UserContentModel) =>
                        uc.adminComments.some((ac) => ac.commentId === adminCommentId)
                    );

                    if (userContentWithAdminComment) {
                        const updatedAdminComments = userContentWithAdminComment.adminComments.filter(
                            (ac) => ac.commentId !== adminCommentId
                        );
                        userContentWithAdminComment.adminComments = updatedAdminComments;

                        const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(userContentWithAdminComment)
                        });
                        return userContentUpdateResponse.ok;
                    }
                }
                return false;
            }

            const userContentResponse = await fetch(`${API_BASE_URL}/userContent/get/userId/${adminCommentToDelete.userId}`);
            if (!userContentResponse.ok) {
                console.error('Failed to get user_content for userId:', adminCommentToDelete.userId);
                return false;
            }

            const userContent = await userContentResponse.json();
            const updatedAdminComments = userContent.adminComments.filter(
                (ac: UserContentAdminComment) => ac.commentId !== adminCommentId
            );
            userContent.adminComments = updatedAdminComments;

            const userContentUpdateResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userContent)
            });
            return userContentUpdateResponse.ok;
        } catch (error) {
            console.error('Error deleting admin comment:', error);
            return false;
        }
    }

    // Get force deleted comments (for admin review)
    static async getForceDeletedComments(): Promise<
        {
            userId: string;
            comments: UserContentComment[];
            adminComments: UserContentAdminComment[];
        }[]
    > {
        try {
            const response = await fetch(`${API_BASE_URL}/userContent/getall`);
            if (!response.ok) {
                throw new Error('Failed to fetch user content');
            }
            const allUserContent = await response.json();

            // Filter for user content that has comments marked as deleted by admin
            const userContentWithDeletedComments = allUserContent.filter((uc: UserContentModel) =>
                uc.comments.some((c) => c.deletedByAdmin === true)
            );

            // Return only the relevant data
            return userContentWithDeletedComments.map((uc: UserContentModel) => ({
                userId: uc.userId,
                comments: uc.comments.filter((c) => c.deletedByAdmin === true),
                adminComments: uc.adminComments
            }));
        } catch (error) {
            console.error('Error fetching force deleted comments:', error);
            return [];
        }
    }

    // Get admin activity for a specific post
    static async getPostAdminActivity(postId: string): Promise<{
        forceDeletedComments: PostComment[];
        adminComments: PostAdminComment[];
    }> {
        try {
            const forceDeletedComments: PostComment[] = [];
            const adminComments: PostAdminComment[] = [];

            // Get all user content
            const response = await fetch(`${API_BASE_URL}/userContent/getall`);
            if (!response.ok) {
                throw new Error('Failed to fetch user content');
            }
            const allUserContent = await response.json();

            // Find comments and admin comments related to this post
            allUserContent.forEach((uc: UserContentModel) => {
                // Find force deleted comments for this post
                const deletedCommentsForPost = uc.comments.filter(
                    (c) => c.postId === postId && c.deletedByAdmin === true
                );
                forceDeletedComments.push(...deletedCommentsForPost);

                // Find admin comments for this post
                const adminCommentsForPost = uc.adminComments.filter((ac) => ac.postId === postId);
                adminComments.push(...adminCommentsForPost);
            });

            return { forceDeletedComments, adminComments };
        } catch (error) {
            console.error('Error fetching post admin activity:', error);
            return { forceDeletedComments: [], adminComments: [] };
        }
    }
} 