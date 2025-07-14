import type {
    GalleryContentModel,
    ContentModelUpdate,
    PostComment,
    PostCommentRequest,
    UserContentModel,
    UserContentComment,
    UserContentAdminComment
} from '$lib/utils/types';

const API_BASE_URL = 'http://localhost:8080';

export class GalleryService {
    // Get all gallery posts
    static async getAllPosts(): Promise<GalleryContentModel[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/gallery/getall`);
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
    static async getPostBySlug(slug: string): Promise<GalleryContentModel | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/gallery/get/slug/${slug}`);
            if (!response.ok) return null;
            const post = await response.json();

            return post;
        } catch (error) {
            console.error('Error fetching post by slug:', error);
            return null;
        }
    }

    // Get a single post by postId
    static async getPostById(postId: string): Promise<GalleryContentModel | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/gallery/get/postId/${postId}`);
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
        width?: number;
        height?: number;
    }): Promise<{ success: boolean; slug: string }> {
        try {
            const date = new Date().toISOString();
            const requestData = {
                title: postData.title,
                coverImage: postData.coverImage,
                width: postData.width,
                height: postData.height,
                date
            };
            const response = await fetch(`${API_BASE_URL}/gallery/createEntry`, {
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
            const response = await fetch(`${API_BASE_URL}/gallery/update`, {
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
            const response = await fetch(`${API_BASE_URL}/gallery/delete/id/${post.id}`, {
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
            console.log('Adding comment with userId:', userId);
            const date = new Date().toISOString();
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            // Filter out any existing comments with empty userId to prevent data corruption
            const validExistingComments = post.comments.filter((c) => c.userId && c.userId.trim() !== '');
            console.log(
                'Valid existing comments:',
                validExistingComments.length,
                'out of',
                post.comments.length
            );

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
                section: 'gallery',
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

            // Update the post in the gallery database
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post comment');

            // Update the comment in the user_content database
            console.log('Attempting to update user_content for userId:', commentToUpdate.userId);

            if (!commentToUpdate.userId || commentToUpdate.userId.trim() === '') {
                console.error('Cannot update user_content: comment has empty userId');
                console.log('Attempting to find user_content by searching for commentId:', commentId);

                // Try to find the user_content by searching for the commentId
                const allUserContentResponse = await fetch(`${API_BASE_URL}/userContent/getall`);
                if (allUserContentResponse.ok) {
                    const allUserContent: UserContentModel[] = await allUserContentResponse.json();
                    const userContentWithComment = allUserContent.find((uc) =>
                        uc.comments.some((c) => c.commentId === commentId)
                    );

                    if (userContentWithComment) {
                        console.log('Found user_content by searching for commentId');
                        const updatedUserComments = userContentWithComment.comments.map((comment) =>
                            comment.commentId === commentId
                                ? { ...comment, text: newText, date: new Date().toISOString() }
                                : comment
                        );

                        // Remove any _class field if present
                        const { _class, ...userContentClean } = userContentWithComment as any;

                        const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...userContentClean, comments: updatedUserComments })
                        });

                        if (!userContentSaveResponse.ok) {
                            console.error(
                                'Failed to update user_content:',
                                userContentSaveResponse.status,
                                userContentSaveResponse.statusText
                            );
                            throw new Error('Failed to update user content');
                        }

                        console.log('Successfully updated user_content via search');
                        return true;
                    } else {
                        console.error('Could not find user_content containing commentId:', commentId);
                        return false;
                    }
                } else {
                    console.error('Failed to fetch all user_content');
                    return false;
                }
            }

            const userContentResponse = await fetch(
                `${API_BASE_URL}/userContent/get/userId/${commentToUpdate.userId}`
            );

            if (userContentResponse.ok) {
                const userContent: UserContentModel = await userContentResponse.json();
                console.log('Found user_content, updating comment:', commentId);
                console.log('Original user_content comments:', userContent.comments);

                // Find the comment in user_content by commentId
                const existingComment = userContent.comments.find((c) => c.commentId === commentId);
                let updatedUserComments: any[];

                if (!existingComment) {
                    console.error('Comment not found in user_content with commentId:', commentId);
                    console.log(
                        'Available commentIds in user_content:',
                        userContent.comments.map((c) => c.commentId)
                    );
                    return false; // Cannot update if comment doesn't exist in user_content
                }

                updatedUserComments = userContent.comments.map((comment) => {
                    if (comment.commentId === commentId) {
                        console.log(
                            'Updating comment:',
                            comment.commentId,
                            'from:',
                            comment.text,
                            'to:',
                            newText
                        );
                        return { ...comment, text: newText, date: new Date().toISOString() };
                    }
                    return comment;
                });

                console.log('Updated user_content comments:', updatedUserComments);

                // Remove any _class field if present
                const { _class, ...userContentClean } = userContent as any;

                const updatePayload = { ...userContentClean, comments: updatedUserComments };
                console.log('Sending update payload:', updatePayload);

                const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });

                if (!userContentSaveResponse.ok) {
                    console.error(
                        'Failed to update user_content:',
                        userContentSaveResponse.status,
                        userContentSaveResponse.statusText
                    );
                    throw new Error('Failed to update user content');
                }

                console.log('Successfully updated user_content');

                // Verify the update by fetching the user_content again
                const verifyResponse = await fetch(
                    `${API_BASE_URL}/userContent/get/userId/${commentToUpdate.userId}`
                );
                if (verifyResponse.ok) {
                    const verifiedUserContent = await verifyResponse.json();
                    const updatedComment = verifiedUserContent.comments.find(
                        (c: any) => c.commentId === commentId
                    );
                    console.log('Verification - updated comment text:', updatedComment?.text);
                }
            } else {
                console.error(
                    `User content not found for userId: ${commentToUpdate.userId}`,
                    userContentResponse.status,
                    userContentResponse.statusText
                );
                return false;
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
            const commentToDelete = post.comments.find((c) => c.commentId === commentId);
            if (!commentToDelete) throw new Error('Comment not found');
            const updatedComments = post.comments.filter((comment) => comment.commentId !== commentId);
            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post after comment deletion');
            const userContentResponse = await fetch(
                `${API_BASE_URL}/userContent/get/userId/${commentToDelete.userId}`
            );
            if (userContentResponse.ok) {
                const userContent: UserContentModel = await userContentResponse.json();
                const updatedUserComments = userContent.comments.filter(
                    (comment) => comment.commentId !== commentId
                );
                const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                    method: 'PUT',
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

    // Admin force delete a comment (removes from post, keeps in user_content with flag)
    static async adminForceDeleteComment(
        postId: string,
        commentId: string,
        adminUserId: string,
        adminUserName: string
    ): Promise<boolean> {
        try {
            console.log('Admin force deleting comment:', commentId, 'by admin:', adminUserName);
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            const commentToDelete = post.comments.find((c) => c.commentId === commentId);
            if (!commentToDelete) throw new Error('Comment not found');

            // Remove the comment from the post completely
            const updatedComments = post.comments.filter((comment) => comment.commentId !== commentId);

            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post after admin comment deletion');

            // Keep the comment in user_content but mark it as deleted by admin
            if (commentToDelete.userId && commentToDelete.userId.trim() !== '') {
                const userContentResponse = await fetch(
                    `${API_BASE_URL}/userContent/get/userId/${commentToDelete.userId}`
                );
                if (userContentResponse.ok) {
                    const userContent: UserContentModel = await userContentResponse.json();
                    const updatedUserComments = userContent.comments.map((comment) =>
                        comment.commentId === commentId
                            ? {
                                ...comment,
                                deletedByAdmin: true
                            }
                            : comment
                    );

                    // Add admin comment to the separate adminComments array
                    const adminCommentId = crypto.randomUUID();
                    const newAdminComment: UserContentAdminComment = {
                        commentId: adminCommentId,
                        onComment: commentId,
                        postId: postId,
                        postTitle: post.title,
                        section: 'gallery',
                        text: `Comment deleted by admin: ${adminUserName}`,
                        date: new Date().toISOString()
                    };

                    const updatedAdminComments = [...(userContent.adminComments || []), newAdminComment];

                    const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...userContent,
                            comments: updatedUserComments,
                            adminComments: updatedAdminComments
                        })
                    });

                    if (!userContentSaveResponse.ok) {
                        console.error('Failed to update user_content after admin deletion');
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error admin force deleting comment:', error);
            return false;
        }
    }

    // Add admin comment to a comment
    static async addAdminComment(
        postId: string,
        commentId: string,
        adminCommentText: string,
        adminUserId: string,
        adminUserName: string
    ): Promise<boolean> {
        try {
            console.log('Adding admin comment to comment:', commentId, 'by admin:', adminUserName);
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            const commentToUpdate = post.comments.find((c) => c.commentId === commentId);
            if (!commentToUpdate) throw new Error('Comment not found');

            // Generate a single commentId for the admin comment
            const adminCommentId = crypto.randomUUID();

            // Add admin comment to the comment's adminComments array
            const updatedComments = post.comments.map((comment) =>
                comment.commentId === commentId
                    ? {
                        ...comment,
                        adminComments: [
                            ...(comment.adminComments || []),
                            {
                                userId: adminUserId,
                                commentId: adminCommentId,
                                onComment: commentId,
                                text: adminCommentText,
                                date: new Date().toISOString()
                            }
                        ]
                    }
                    : comment
            );

            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post with admin comment');

            // Also add to user_content if the user exists
            if (commentToUpdate.userId && commentToUpdate.userId.trim() !== '') {
                const userContentResponse = await fetch(
                    `${API_BASE_URL}/userContent/get/userId/${commentToUpdate.userId}`
                );
                if (userContentResponse.ok) {
                    const userContent: UserContentModel = await userContentResponse.json();

                    // Add admin comment to the separate adminComments array with the same commentId
                    const newAdminComment: UserContentAdminComment = {
                        commentId: adminCommentId, // Use the same commentId
                        onComment: commentId,
                        postId: postId,
                        postTitle: post.title,
                        section: 'gallery',
                        text: adminCommentText,
                        date: new Date().toISOString()
                    };

                    const updatedAdminComments = [...(userContent.adminComments || []), newAdminComment];

                    const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...userContent,
                            adminComments: updatedAdminComments
                        })
                    });

                    if (!userContentSaveResponse.ok) {
                        console.error('Failed to update user_content with admin comment');
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error adding admin comment:', error);
            return false;
        }
    }

    // Delete an admin comment
    static async deleteAdminComment(
        postId: string,
        commentId: string,
        adminCommentId: string
    ): Promise<boolean> {
        try {
            console.log('Deleting admin comment:', adminCommentId, 'from comment:', commentId);
            const post = await this.getPostById(postId);
            if (!post) throw new Error('Post not found');

            const commentToUpdate = post.comments.find((c) => c.commentId === commentId);
            if (!commentToUpdate) throw new Error('Comment not found');

            // Remove the admin comment from the comment's adminComments array
            const updatedComments = post.comments.map((comment) =>
                comment.commentId === commentId
                    ? {
                        ...comment,
                        adminComments: (comment.adminComments || []).filter(
                            (ac) => ac.commentId !== adminCommentId
                        )
                    }
                    : comment
            );

            const postUpdateSuccess = await this.updatePost(post.slug, { comments: updatedComments });
            if (!postUpdateSuccess) throw new Error('Failed to update post after admin comment deletion');

            // Also remove from user_content if the user exists
            if (commentToUpdate.userId && commentToUpdate.userId.trim() !== '') {
                const userContentResponse = await fetch(
                    `${API_BASE_URL}/userContent/get/userId/${commentToUpdate.userId}`
                );
                if (userContentResponse.ok) {
                    const userContent: UserContentModel = await userContentResponse.json();
                    console.log('Found user_content for userId:', commentToUpdate.userId);
                    console.log('Current admin comments in user_content:', userContent.adminComments);

                    // Remove the admin comment from the separate adminComments array
                    const updatedAdminComments = (userContent.adminComments || []).filter(
                        (ac) => ac.commentId !== adminCommentId
                    );

                    console.log('Admin comments after filtering:', updatedAdminComments);
                    console.log('Looking for adminCommentId:', adminCommentId);

                    const userContentSaveResponse = await fetch(`${API_BASE_URL}/userContent/update`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...userContent,
                            adminComments: updatedAdminComments
                        })
                    });

                    if (!userContentSaveResponse.ok) {
                        console.error('Failed to update user_content after admin comment deletion');
                    } else {
                        console.log('Successfully updated user_content after admin comment deletion');
                    }
                } else {
                    console.error('Failed to fetch user_content for userId:', commentToUpdate.userId);
                }
            } else {
                console.error('Comment has no userId, cannot update user_content');
            }

            return true;
        } catch (error) {
            console.error('Error deleting admin comment:', error);
            return false;
        }
    }

    // Get force-deleted comments and admin comments from user_content for admin review
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

            const allUserContent: UserContentModel[] = await response.json();
            const adminData: {
                userId: string;
                comments: UserContentComment[];
                adminComments: UserContentAdminComment[];
            }[] = [];

            allUserContent.forEach((userContent) => {
                const forceDeletedComments = userContent.comments.filter(
                    (comment) => comment.deletedByAdmin
                );
                const hasAdminComments = userContent.adminComments && userContent.adminComments.length > 0;

                if (forceDeletedComments.length > 0 || hasAdminComments) {
                    adminData.push({
                        userId: userContent.userId,
                        comments: forceDeletedComments,
                        adminComments: userContent.adminComments || []
                    });
                }
            });

            return adminData;
        } catch (error) {
            console.error('Error fetching force-deleted comments:', error);
            return [];
        }
    }

    // Get admin activity for a specific post only
    static async getPostAdminActivity(postId: string): Promise<{
        forceDeletedComments: PostComment[];
        adminComments: PostAdminComment[];
    }> {
        try {
            const post = await this.getPostById(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            // Get force-deleted comments from this post
            const forceDeletedComments = post.comments.filter(comment => comment.deletedByAdmin);

            // Get all admin comments from this post
            const adminComments: PostAdminComment[] = [];
            post.comments.forEach(comment => {
                if (comment.adminComments && comment.adminComments.length > 0) {
                    adminComments.push(...comment.adminComments);
                }
            });

            return {
                forceDeletedComments,
                adminComments
            };
        } catch (error) {
            console.error('Error fetching post admin activity:', error);
            return {
                forceDeletedComments: [],
                adminComments: []
            };
        }
    }
} 