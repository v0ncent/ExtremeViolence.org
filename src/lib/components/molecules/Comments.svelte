<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import Button from '$lib/components/atoms/Button.svelte';
	import { onMount } from 'svelte';
	import { NewsService } from '$lib/services/newsService';
	import { GalleryService } from '$lib/services/galleryService';
	import { UserService } from '$lib/services/userService';
	import type {
		PostComment,
		UserContentComment,
		UserDataModel,
		PostAdminComment
	} from '$lib/utils/types';

	export let postSlug: string;
	export let postId: string | undefined;
	export let service: 'news' | 'gallery' = 'news';

	// Special creator account details
	const CREATOR_EMAIL = 'vincentlikesrobots@gmail.com';
	const CREATOR_USER_ID = 'b1f16a98-7540-4ab8-9201-bca6a44e0b19';

	// Get the appropriate service based on the service prop
	$: serviceInstance = service === 'gallery' ? GalleryService : NewsService;

	// Remove local Comment interface and use backend types for mapping
	let comments: PostComment[] = [];
	let newComment = '';
	let isSubmitting = false;
	let currentUser: any = null;
	let commentUsers: Map<string, UserDataModel> = new Map();
	let usersLoaded = false;

	// Edit comment state
	let editingCommentId: string | null = null;
	let editingText = '';
	let isEditing = false;
	let isSaving = false;
	let isDeleting = false;

	// Admin functionality state
	let addingAdminCommentFor: string | null = null;
	let adminCommentText = '';
	let isAddingAdminComment = false;
	let isForceDeleting = false;
	let isDeletingAdminComment = false;
	let copiedUserId: string | null = null;

	onMount(async () => {
		const unsubscribe = auth.subscribe(($auth) => {
			if ($auth.user) {
				currentUser = $auth.user;
			}
		});

		// Load existing comments from database
		await loadComments();

		return unsubscribe;
	});

	async function loadComments() {
		if (!postId) {
			console.warn('No postId provided, comments not available for this post type');
			return;
		}

		try {
			const post = await serviceInstance.getPostById(postId);
			if (post) {
				comments = post.comments;
				// Load user information for all comments
				await loadCommentUsers();
			}
		} catch (error) {
			console.error('Error loading comments:', error);
		}
	}

	async function loadCommentUsers() {
		const userPromises = comments.map(async (comment) => {
			if (!commentUsers.has(comment.userId)) {
				const user = await UserService.getUserByIdWithFallback(comment.userId);
				if (user) {
					commentUsers.set(comment.userId, user);
				}
			}
		});
		await Promise.all(userPromises);
		usersLoaded = true;
		commentUsers = commentUsers; // Trigger reactivity
	}

	async function addComment() {
		if (!newComment.trim() || !currentUser || isSubmitting || !postId) return;

		isSubmitting = true;

		try {
			// Add comment to database using the user's _id (custom UUID)
			const success = await serviceInstance.addComment(postId, currentUser._id, newComment.trim());

			if (success) {
				// Reload comments to get the updated list
				await loadComments();
				newComment = '';
			} else {
				console.error('Failed to add comment');
			}
		} catch (error) {
			console.error('Error adding comment:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function formatDate(date: string): string {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}

	function isAdmin(user: UserDataModel | undefined): boolean {
		if (!user) return false;
		return user.isAdmin || (user as any)?.admin || false;
	}

	function canEditComment(comment: PostComment): boolean {
		if (!currentUser) return false;
		return comment.userId === currentUser._id || currentUser.isAdmin;
	}

	function canDeleteComment(comment: PostComment): boolean {
		if (!currentUser) return false;
		return comment.userId === currentUser._id || currentUser.isAdmin;
	}

	function startEditComment(comment: PostComment) {
		editingCommentId = comment.commentId;
		editingText = comment.text;
		isEditing = true;
	}

	function cancelEditComment() {
		editingCommentId = null;
		editingText = '';
		isEditing = false;
		isSaving = false;
		isDeleting = false;
	}

	async function saveEditComment() {
		if (!editingCommentId || !editingText.trim() || !postId || isSaving) return;

		isSaving = true;

		try {
			const success = await serviceInstance.updateComment(
				postId,
				editingCommentId,
				editingText.trim()
			);

			if (success) {
				// Reload comments to get the updated list
				await loadComments();
				cancelEditComment();
			} else {
				console.error('Failed to update comment');
			}
		} catch (error) {
			console.error('Error updating comment:', error);
		} finally {
			isSaving = false;
		}
	}

	async function deleteComment(comment: PostComment) {
		if (!postId || isDeleting) return;

		if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
			return;
		}

		isDeleting = true;

		try {
			const success = await serviceInstance.deleteComment(postId, comment.commentId);

			if (success) {
				// Reload comments to get the updated list
				await loadComments();
			} else {
				console.error('Failed to delete comment');
			}
		} catch (error) {
			console.error('Error deleting comment:', error);
		} finally {
			isDeleting = false;
		}
	}

	async function adminForceDeleteComment(comment: PostComment) {
		if (!postId || isForceDeleting || !currentUser) return;

		if (
			!confirm(
				'Are you sure you want to force delete this comment as an admin? This will mark it as deleted and cannot be undone.'
			)
		) {
			return;
		}

		isForceDeleting = true;

		try {
			const success = await serviceInstance.adminForceDeleteComment(
				postId,
				comment.commentId,
				currentUser._id,
				currentUser.userName || currentUser.email.split('@')[0]
			);

			if (success) {
				// Reload comments to get the updated list
				await loadComments();
			} else {
				console.error('Failed to force delete comment');
			}
		} catch (error) {
			console.error('Error force deleting comment:', error);
		} finally {
			isForceDeleting = false;
		}
	}

	function startAddAdminNote(comment: PostComment) {
		addingAdminCommentFor = comment.commentId;
		adminCommentText = '';
	}

	function cancelAddAdminNote() {
		addingAdminCommentFor = null;
		adminCommentText = '';
		isAddingAdminComment = false;
	}

	async function saveAdminNote(comment: PostComment) {
		if (!postId || !adminCommentText.trim() || isAddingAdminComment || !currentUser) return;

		isAddingAdminComment = true;

		try {
			const success = await serviceInstance.addAdminComment(
				postId,
				comment.commentId,
				adminCommentText.trim(),
				currentUser._id,
				currentUser.userName || currentUser.email.split('@')[0]
			);

			if (success) {
				// Reload comments to get the updated list
				await loadComments();
				cancelAddAdminNote();
			} else {
				console.error('Failed to add admin comment');
			}
		} catch (error) {
			console.error('Error adding admin comment:', error);
		} finally {
			isAddingAdminComment = false;
		}
	}

	async function viewAdminActivity() {
		if (!currentUser?.isAdmin || !postId) return;

		try {
			const adminData = await serviceInstance.getPostAdminActivity(postId);

			// Display post-specific admin activity
			alert(
				`Admin Activity for this post:\n\nForce-deleted comments: ${adminData.forceDeletedComments.length}\nAdmin comments: ${adminData.adminComments.length}`
			);
		} catch (error) {
			console.error('Error fetching post admin activity:', error);
		}
	}

	async function deleteAdminComment(comment: PostComment, adminComment: PostAdminComment) {
		if (!postId || isDeletingAdminComment) return;

		if (
			!confirm('Are you sure you want to delete this admin comment? This action cannot be undone.')
		) {
			return;
		}

		isDeletingAdminComment = true;

		try {
			const success = await serviceInstance.deleteAdminComment(
				postId,
				comment.commentId,
				adminComment.commentId
			);

			if (success) {
				// Reload comments to get the updated list
				await loadComments();
			} else {
				console.error('Failed to delete admin comment');
			}
		} catch (error) {
			console.error('Error deleting admin comment:', error);
		} finally {
			isDeletingAdminComment = false;
		}
	}

	async function copyUserId(userId: string) {
		try {
			await navigator.clipboard.writeText(userId);
			copiedUserId = userId;

			// Reset the copied state after 2 seconds
			setTimeout(() => {
				copiedUserId = null;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy user ID:', error);
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = userId;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);

			copiedUserId = userId;
			setTimeout(() => {
				copiedUserId = null;
			}, 2000);
		}
	}
</script>

<div class="comments-section">
	{#if postId}
		<div class="comments-header">
			<h3>Comments ({comments.length})</h3>
			{#if currentUser?.isAdmin}
				<Button
					color="secondary"
					size="small"
					style="clear"
					on:click={() => viewAdminActivity()}
					class="admin-activity-btn"
				>
					View Post Admin Activity
				</Button>
			{/if}
		</div>

		{#if currentUser}
			<div class="comment-form">
				{#if currentUser._id === CREATOR_USER_ID}
					<div class="user-info creator-user-info" style="position: relative;">
						<div class="roaring-flame-background">
							<div class="flame-layer flame-layer-1" />
							<div class="flame-layer flame-layer-2" />
							<div class="flame-layer flame-layer-3" />
							<div class="flame-layer flame-layer-4" />
						</div>
						<div class="user-avatar">
							{#if currentUser.imagePath}
								<img src={currentUser.imagePath} alt="Profile" class="avatar-image" />
							{:else}
								<div class="avatar-placeholder">
									{currentUser.email.charAt(0).toUpperCase()}
								</div>
							{/if}
						</div>
						<div class="user-details">
							<span class="username creator-name">
								{currentUser.userName || currentUser.email.split('@')[0]}
							</span>
							{#if currentUser.isAdmin}
								<span class="admin-badge">Admin</span>
							{/if}
						</div>
					</div>
				{:else}
					<div class="user-info">
						<div class="user-avatar">
							{#if currentUser.imagePath}
								<img src={currentUser.imagePath} alt="Profile" class="avatar-image" />
							{:else}
								<div class="avatar-placeholder">
									{currentUser.email.charAt(0).toUpperCase()}
								</div>
							{/if}
						</div>
						<div class="user-details">
							<span class="username">
								{currentUser.userName || currentUser.email.split('@')[0]}
							</span>
							{#if currentUser.isAdmin}
								<span class="admin-badge">Admin</span>
							{/if}
						</div>
					</div>
				{/if}
				<div class="form-content">
					<textarea
						bind:value={newComment}
						placeholder="Write a comment..."
						rows="3"
						maxlength="1000"
					/>
					<div class="form-actions">
						<span class="char-count">{newComment.length}/1000</span>
						<Button
							color="primary"
							size="small"
							style="solid"
							on:click={addComment}
							disabled={!newComment.trim() || isSubmitting}
						>
							{isSubmitting ? 'Posting...' : 'Post Comment'}
						</Button>
					</div>
				</div>
			</div>
		{:else}
			<div class="login-prompt">
				<p>Please <a href="/login">log in</a> to leave a comment.</p>
			</div>
		{/if}

		<div class="comments-list">
			{#if comments.length === 0}
				<div class="no-comments">
					<p>No comments yet. Be the first to comment!</p>
				</div>
			{:else if !usersLoaded}
				<div class="loading-comments">
					<p>Loading comments...</p>
				</div>
			{:else}
				{#each comments as comment (comment.commentId)}
					{@const commentUser = commentUsers.get(comment.userId)}
					{#if comment.userId === CREATOR_USER_ID}
						<div class="comment creator-comment-author">
							<div class="comment-header">
								<div class="comment-author creator-author" style="position: relative;">
									<div class="roaring-flame-background">
										<div class="flame-layer flame-layer-1" />
										<div class="flame-layer flame-layer-2" />
										<div class="flame-layer flame-layer-3" />
										<div class="flame-layer flame-layer-4" />
									</div>
									<div class="author-avatar">
										{#if commentUser?.imagePath}
											<img src={commentUser.imagePath} alt="Profile" class="avatar-image" />
										{:else}
											<div class="avatar-placeholder">
												{(commentUser?.userName || commentUser?.email || 'U')
													.charAt(0)
													.toUpperCase()}
											</div>
										{/if}
									</div>
									<div class="author-info">
										<div class="user-meta">
											<span class="username creator-name">
												{commentUser?.userName ||
													commentUser?.email?.split('@')[0] ||
													'Unknown User'}
											</span>
											{#if isAdmin(commentUser)}
												<span class="admin-badge">Admin</span>
											{/if}
										</div>
										<!-- Debug: {JSON.stringify(commentUser)} -->
										<span class="comment-date">{formatDate(comment.date)}</span>
									</div>
								</div>
							</div>
							<div class="comment-content">
								{#if editingCommentId === comment.commentId}
									<div class="edit-form">
										<textarea
											bind:value={editingText}
											placeholder="Edit your comment..."
											rows="3"
											maxlength="1000"
										/>
										<div class="edit-actions">
											<span class="char-count">{editingText.length}/1000</span>
											<div class="edit-buttons">
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={cancelEditComment}
													disabled={isSaving}
												>
													Cancel
												</Button>
												<Button
													color="primary"
													size="small"
													style="solid"
													on:click={saveEditComment}
													disabled={!editingText.trim() || isSaving}
												>
													{isSaving ? 'Saving...' : 'Save'}
												</Button>
											</div>
										</div>
									</div>
								{:else}
									<p>{comment.text}</p>
									{#if comment.adminComments && comment.adminComments.length > 0}
										{#each comment.adminComments as adminComment}
											<div class="admin-comment">
												<div class="admin-comment-content">
													<strong>Admin Note:</strong>
													{adminComment.text}
												</div>
												{#if currentUser?.isAdmin}
													<div class="admin-comment-actions">
														<Button
															color="secondary"
															size="small"
															style="clear"
															on:click={() => deleteAdminComment(comment, adminComment)}
															disabled={isDeletingAdminComment}
															class="admin-comment-delete-btn"
														>
															{isDeletingAdminComment ? 'Deleting...' : 'Delete'}
														</Button>
													</div>
												{/if}
											</div>
										{/each}
									{/if}

									{#if canEditComment(comment) || canDeleteComment(comment) || currentUser?.isAdmin}
										<div class="comment-actions">
											{#if canEditComment(comment)}
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => startEditComment(comment)}
												>
													Edit
												</Button>
											{/if}
											{#if canDeleteComment(comment)}
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => deleteComment(comment)}
													disabled={isDeleting}
												>
													{isDeleting ? 'Deleting...' : 'Delete'}
												</Button>
											{/if}
											{#if currentUser?.isAdmin}
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => copyUserId(comment.userId)}
													class="copy-user-id-btn"
												>
													{copiedUserId === comment.userId ? 'Copied!' : 'Copy User ID'}
												</Button>
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => adminForceDeleteComment(comment)}
													disabled={isForceDeleting}
													class="admin-force-delete-btn"
												>
													{isForceDeleting ? 'Force Deleting...' : 'Force Delete'}
												</Button>
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => startAddAdminNote(comment)}
													class="admin-note-btn"
												>
													Add Note
												</Button>
											{/if}
										</div>
									{/if}

									{#if addingAdminCommentFor === comment.commentId}
										<div class="admin-note-form">
											<textarea
												bind:value={adminCommentText}
												placeholder="Enter admin note..."
												rows="2"
												maxlength="500"
											/>
											<div class="admin-note-actions">
												<span class="char-count">{adminCommentText.length}/500</span>
												<div class="admin-note-buttons">
													<Button
														color="secondary"
														size="small"
														style="clear"
														on:click={cancelAddAdminNote}
														disabled={isAddingAdminComment}
													>
														Cancel
													</Button>
													<Button
														color="secondary"
														size="small"
														style="solid"
														on:click={() => saveAdminNote(comment)}
														disabled={!adminCommentText.trim() || isAddingAdminComment}
													>
														{isAddingAdminComment ? 'Adding...' : 'Add Note'}
													</Button>
												</div>
											</div>
										</div>
									{/if}
								{/if}
							</div>
						</div>
					{:else}
						<div class="comment">
							<div class="comment-header">
								<div class="comment-author">
									<div class="author-avatar">
										{#if commentUser?.imagePath}
											<img src={commentUser.imagePath} alt="Profile" class="avatar-image" />
										{:else}
											<div class="avatar-placeholder">
												{(commentUser?.userName || commentUser?.email || 'U')
													.charAt(0)
													.toUpperCase()}
											</div>
										{/if}
									</div>
									<div class="author-info">
										<div class="user-meta">
											<span class="username">
												{commentUser?.userName ||
													commentUser?.email?.split('@')[0] ||
													'Unknown User'}
											</span>
											{#if isAdmin(commentUser)}
												<span class="admin-badge">Admin</span>
											{/if}
										</div>
										<!-- Debug: {JSON.stringify(commentUser)} -->
										<span class="comment-date">{formatDate(comment.date)}</span>
									</div>
								</div>
							</div>
							<div class="comment-content">
								{#if editingCommentId === comment.commentId}
									<div class="edit-form">
										<textarea
											bind:value={editingText}
											placeholder="Edit your comment..."
											rows="3"
											maxlength="1000"
										/>
										<div class="edit-actions">
											<span class="char-count">{editingText.length}/1000</span>
											<div class="edit-buttons">
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={cancelEditComment}
													disabled={isSaving}
												>
													Cancel
												</Button>
												<Button
													color="primary"
													size="small"
													style="solid"
													on:click={saveEditComment}
													disabled={!editingText.trim() || isSaving}
												>
													{isSaving ? 'Saving...' : 'Save'}
												</Button>
											</div>
										</div>
									</div>
								{:else}
									<p>{comment.text}</p>
									{#if comment.adminComments && comment.adminComments.length > 0}
										{#each comment.adminComments as adminComment}
											<div class="admin-comment">
												<div class="admin-comment-content">
													<strong>Admin Note:</strong>
													{adminComment.text}
												</div>
												{#if currentUser?.isAdmin}
													<div class="admin-comment-actions">
														<Button
															color="secondary"
															size="small"
															style="clear"
															on:click={() => deleteAdminComment(comment, adminComment)}
															disabled={isDeletingAdminComment}
															class="admin-comment-delete-btn"
														>
															{isDeletingAdminComment ? 'Deleting...' : 'Delete'}
														</Button>
													</div>
												{/if}
											</div>
										{/each}
									{/if}

									{#if canEditComment(comment) || canDeleteComment(comment) || currentUser?.isAdmin}
										<div class="comment-actions">
											{#if canEditComment(comment)}
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => startEditComment(comment)}
												>
													Edit
												</Button>
											{/if}
											{#if canDeleteComment(comment)}
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => deleteComment(comment)}
													disabled={isDeleting}
												>
													{isDeleting ? 'Deleting...' : 'Delete'}
												</Button>
											{/if}
											{#if currentUser?.isAdmin}
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => copyUserId(comment.userId)}
													class="copy-user-id-btn"
												>
													{copiedUserId === comment.userId ? 'Copied!' : 'Copy User ID'}
												</Button>
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => adminForceDeleteComment(comment)}
													disabled={isForceDeleting}
													class="admin-force-delete-btn"
												>
													{isForceDeleting ? 'Force Deleting...' : 'Force Delete'}
												</Button>
												<Button
													color="secondary"
													size="small"
													style="clear"
													on:click={() => startAddAdminNote(comment)}
													class="admin-note-btn"
												>
													Add Note
												</Button>
											{/if}
										</div>
									{/if}

									{#if addingAdminCommentFor === comment.commentId}
										<div class="admin-note-form">
											<textarea
												bind:value={adminCommentText}
												placeholder="Enter admin note..."
												rows="2"
												maxlength="500"
											/>
											<div class="admin-note-actions">
												<span class="char-count">{adminCommentText.length}/500</span>
												<div class="admin-note-buttons">
													<Button
														color="secondary"
														size="small"
														style="clear"
														on:click={cancelAddAdminNote}
														disabled={isAddingAdminComment}
													>
														Cancel
													</Button>
													<Button
														color="secondary"
														size="small"
														style="solid"
														on:click={() => saveAdminNote(comment)}
														disabled={!adminCommentText.trim() || isAddingAdminComment}
													>
														{isAddingAdminComment ? 'Adding...' : 'Add Note'}
													</Button>
												</div>
											</div>
										</div>
									{/if}
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	{:else}
		<div class="no-comments">
			<p>Comments are not available for this post type.</p>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/scss/_mixins.scss';

	.comments-section {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color--border);
		width: 50vw; /* Use viewport width to span to center */
		max-width: 50vw;
		margin-left: 10rem; /* Offset from left edge */
		margin-right: auto;
		grid-column: 1 / -1; /* Break out of the grid constraint */

		.comments-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 1.5rem;

			h3 {
				margin: 0;
				color: var(--color--text);
				font-size: 1.25rem;
				font-weight: 600;
			}
		}
	}

	.comment-form {
		background: var(--color--card-background);
		border: 1px solid var(--color--border);
		border-radius: 8px;
		padding: 1.25rem;
		margin-bottom: 1rem;

		.user-info {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			margin-bottom: 1rem;

			.user-avatar {
				.avatar-image {
					width: 60px;
					height: 60px;
					border-radius: 50%;
					object-fit: cover;
				}

				.avatar-placeholder {
					width: 60px;
					height: 60px;
					border-radius: 50%;
					background: var(--color--primary);
					color: white;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: 600;
					font-size: 1.4rem;
				}
			}

			.user-details {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				.username {
					font-weight: 500;
					color: var(--color--text);
				}

				.admin-badge {
					background: #e67e22;
					color: #fff;
					padding: 0.2em 0.7em;
					border-radius: 1em;
					font-size: 0.8em;
				}
			}
		}

		.form-content {
			textarea {
				width: 100%;
				padding: 0.75rem;
				border: 1px solid var(--color--border);
				border-radius: 6px;
				background: var(--color--background);
				color: var(--color--text);
				font-family: inherit;
				font-size: 0.9rem;
				resize: vertical;
				min-height: 80px;

				&:focus {
					outline: none;
					border-color: var(--color--primary);
				}

				&::placeholder {
					color: var(--color--text-muted);
				}
			}

			.form-actions {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 0.75rem;

				.char-count {
					font-size: 0.8rem;
					color: var(--color--text-muted);
				}
			}
		}
	}

	.login-prompt {
		text-align: center;
		padding: 2rem;
		background: var(--color--card-background);
		border: 1px solid var(--color--border);
		border-radius: 8px;
		margin-bottom: 2rem;

		p {
			margin: 0;
			color: var(--color--text-muted);

			a {
				color: var(--color--primary);
				text-decoration: none;
				font-weight: 500;

				&:hover {
					text-decoration: underline;
				}
			}
		}
	}

	.comments-list {
		.no-comments,
		.loading-comments {
			text-align: center;
			padding: 2rem;
			color: var(--color--text-muted);
			font-style: italic;
		}
	}

	.comment {
		background: var(--color--card-background);
		border: 1px solid var(--color--border);
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;

		&:last-child {
			margin-bottom: 0;
		}

		.comment-header {
			margin-bottom: 0.75rem;

			.comment-author {
				display: flex;
				align-items: center;
				gap: 0.75rem;

				.author-avatar {
					.avatar-image {
						width: 65px;
						height: 65px;
						border-radius: 50%;
						object-fit: cover;
					}

					.avatar-placeholder {
						width: 65px;
						height: 65px;
						border-radius: 50%;
						background: var(--color--primary);
						color: white;
						display: flex;
						align-items: center;
						justify-content: center;
						font-weight: 600;
						font-size: 1.5rem;
					}
				}

				.author-info {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 0.5rem;

					.user-meta {
						display: flex;
						align-items: center;
						gap: 0.5rem;
						flex-wrap: wrap;

						.username {
							font-weight: 500;
							color: var(--color--text);
						}

						.admin-badge {
							background: #e67e22;
							color: #fff;
							padding: 0.2em 0.7em;
							border-radius: 1em;
							font-size: 0.75em;
							font-weight: 600;
							white-space: nowrap;
							box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
						}
					}

					.comment-date {
						font-size: 0.8rem;
						color: var(--color--text-muted);
						white-space: nowrap;
					}
				}
			}
		}

		.comment-content {
			p {
				margin: 0;
				line-height: 1.6;
				color: var(--color--text);
				white-space: pre-wrap;
			}
		}
	}

	// Creator roaring flame background effects
	.creator-user-info,
	.creator-author {
		position: relative;
		z-index: 1;
	}

	.roaring-flame-background {
		position: absolute;
		top: -5px;
		left: -5px;
		right: -5px;
		bottom: -5px;
		pointer-events: none;
		z-index: -1;
		overflow: hidden;
		border-radius: 12px;
		max-width: 300px;
	}

	.flame-layer {
		position: absolute;
		width: 100%;
		height: 100%;
		animation: flameSpikes 2.5s infinite;
		transform-origin: left center;

		&.flame-layer-1 {
			background: radial-gradient(
					ellipse 20px 8px at 15% 50%,
					rgba(255, 69, 0, 0.9) 0%,
					transparent 60%
				),
				radial-gradient(ellipse 15px 6px at 30% 30%, rgba(255, 107, 0, 0.8) 0%, transparent 60%),
				radial-gradient(ellipse 12px 5px at 45% 70%, rgba(255, 140, 0, 0.7) 0%, transparent 60%),
				radial-gradient(ellipse 18px 7px at 60% 20%, rgba(255, 215, 0, 0.6) 0%, transparent 60%),
				radial-gradient(ellipse 14px 6px at 75% 60%, rgba(255, 69, 0, 0.8) 0%, transparent 60%),
				radial-gradient(ellipse 16px 5px at 90% 40%, rgba(255, 107, 0, 0.7) 0%, transparent 60%),
				radial-gradient(ellipse 8px 3px at 40% 50%, rgba(0, 191, 255, 0.8) 0%, transparent 70%),
				radial-gradient(ellipse 6px 2px at 70% 30%, rgba(30, 144, 255, 0.7) 0%, transparent 70%);
			animation-delay: 0s;
			animation-duration: 2.2s;
		}

		&.flame-layer-2 {
			background: radial-gradient(
					ellipse 16px 7px at 20% 60%,
					rgba(255, 107, 0, 0.8) 0%,
					transparent 60%
				),
				radial-gradient(ellipse 14px 5px at 35% 20%, rgba(255, 140, 0, 0.7) 0%, transparent 60%),
				radial-gradient(ellipse 20px 8px at 50% 80%, rgba(255, 69, 0, 0.9) 0%, transparent 60%),
				radial-gradient(ellipse 11px 4px at 65% 30%, rgba(255, 215, 0, 0.5) 0%, transparent 60%),
				radial-gradient(ellipse 17px 6px at 80% 70%, rgba(255, 107, 0, 0.8) 0%, transparent 60%),
				radial-gradient(ellipse 13px 5px at 95% 50%, rgba(255, 140, 0, 0.6) 0%, transparent 60%),
				radial-gradient(ellipse 7px 3px at 55% 40%, rgba(0, 191, 255, 0.9) 0%, transparent 70%),
				radial-gradient(ellipse 5px 2px at 85% 60%, rgba(30, 144, 255, 0.8) 0%, transparent 70%);
			animation-delay: 0.6s;
			animation-duration: 2.8s;
		}

		&.flame-layer-3 {
			background: radial-gradient(
					ellipse 18px 6px at 25% 40%,
					rgba(255, 107, 0, 0.7) 0%,
					transparent 60%
				),
				radial-gradient(ellipse 13px 5px at 40% 70%, rgba(255, 69, 0, 0.8) 0%, transparent 60%),
				radial-gradient(ellipse 17px 7px at 55% 30%, rgba(255, 140, 0, 0.9) 0%, transparent 60%),
				radial-gradient(ellipse 15px 6px at 70% 60%, rgba(255, 215, 0, 0.6) 0%, transparent 60%),
				radial-gradient(ellipse 19px 8px at 85% 20%, rgba(255, 69, 0, 0.8) 0%, transparent 60%),
				radial-gradient(ellipse 12px 4px at 100% 80%, rgba(255, 107, 0, 0.7) 0%, transparent 60%);
			animation-delay: 1.2s;
			animation-duration: 2.5s;
		}

		&.flame-layer-4 {
			background: radial-gradient(
					ellipse 14px 5px at 30% 50%,
					rgba(255, 215, 0, 0.6) 0%,
					transparent 60%
				),
				radial-gradient(ellipse 19px 8px at 45% 20%, rgba(255, 69, 0, 0.9) 0%, transparent 60%),
				radial-gradient(ellipse 12px 4px at 60% 80%, rgba(255, 140, 0, 0.7) 0%, transparent 60%),
				radial-gradient(ellipse 16px 7px at 75% 30%, rgba(255, 107, 0, 0.8) 0%, transparent 60%),
				radial-gradient(ellipse 20px 6px at 90% 60%, rgba(255, 215, 0, 0.5) 0%, transparent 60%),
				radial-gradient(ellipse 15px 5px at 105% 40%, rgba(255, 69, 0, 0.8) 0%, transparent 60%);
			animation-delay: 1.8s;
			animation-duration: 3s;
		}
	}

	.blue-sparks {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}

	.spark {
		position: absolute;
		width: 3px;
		height: 3px;
		background: radial-gradient(
			circle,
			rgba(0, 191, 255, 1) 0%,
			rgba(30, 144, 255, 0.8) 50%,
			transparent 100%
		);
		border-radius: 50%;
		animation: sparkFloat 3s infinite;
		box-shadow: 0 0 6px rgba(0, 191, 255, 0.8);

		&.spark-1 {
			top: 20%;
			left: 25%;
			animation-delay: 0s;
			animation-duration: 2.5s;
		}

		&.spark-2 {
			top: 60%;
			left: 45%;
			animation-delay: 0.8s;
			animation-duration: 3.2s;
		}

		&.spark-3 {
			top: 30%;
			left: 65%;
			animation-delay: 1.6s;
			animation-duration: 2.8s;
		}

		&.spark-4 {
			top: 70%;
			left: 85%;
			animation-delay: 2.4s;
			animation-duration: 3.5s;
		}

		&.spark-5 {
			top: 40%;
			left: 15%;
			animation-delay: 1.2s;
			animation-duration: 2.7s;
		}

		&.spark-6 {
			top: 80%;
			left: 55%;
			animation-delay: 0.4s;
			animation-duration: 3s;
		}
	}

	.creator-name {
		position: relative;
		z-index: 2;
	}

	@keyframes flicker {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
		}
		25% {
			transform: scale(1.1) rotate(2deg);
			opacity: 0.8;
		}
		50% {
			transform: scale(0.9) rotate(-1deg);
			opacity: 1;
		}
		75% {
			transform: scale(1.05) rotate(1deg);
			opacity: 0.9;
		}
	}

	@keyframes flameSpikes {
		0% {
			transform: scaleX(0.8) scaleY(1) translateX(-10px);
			opacity: 0.6;
		}
		25% {
			transform: scaleX(1.2) scaleY(1.1) translateX(5px);
			opacity: 1;
		}
		50% {
			transform: scaleX(0.9) scaleY(0.9) translateX(15px);
			opacity: 0.8;
		}
		75% {
			transform: scaleX(1.3) scaleY(1.2) translateX(25px);
			opacity: 0.9;
		}
		100% {
			transform: scaleX(0.8) scaleY(1) translateX(-10px);
			opacity: 0.6;
		}
	}

	@keyframes sparkFloat {
		0% {
			transform: translateY(0) translateX(0) scale(1);
			opacity: 0;
		}
		20% {
			transform: translateY(-5px) translateX(3px) scale(1.2);
			opacity: 1;
		}
		40% {
			transform: translateY(-10px) translateX(-2px) scale(0.8);
			opacity: 0.8;
		}
		60% {
			transform: translateY(-15px) translateX(5px) scale(1.1);
			opacity: 0.6;
		}
		80% {
			transform: translateY(-20px) translateX(-3px) scale(0.9);
			opacity: 0.4;
		}
		100% {
			transform: translateY(-25px) translateX(0) scale(0.5);
			opacity: 0;
		}
	}

	@include for-iphone-se {
		.comment-form {
			padding: 1rem;

			.user-info {
				.user-details {
					flex-direction: column;
					align-items: flex-start;
					gap: 0.25rem;
				}
			}
		}

		.comment {
			padding: 1rem;

			.comment-header {
				.comment-author {
					.author-info {
						flex-direction: column;
						align-items: flex-start;
						gap: 0.25rem;
					}
				}
			}
		}
	}

	// Edit comment styles
	.edit-form {
		margin-top: 0.5rem;

		textarea {
			width: 100%;
			padding: 0.75rem;
			border: 1px solid var(--color--border);
			border-radius: 6px;
			background: var(--color--background);
			color: var(--color--text);
			font-family: inherit;
			font-size: 0.9rem;
			resize: vertical;
			min-height: 80px;

			&:focus {
				outline: none;
				border-color: var(--color--primary);
			}

			&::placeholder {
				color: var(--color--text-muted);
			}
		}

		.edit-actions {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 0.75rem;

			.char-count {
				font-size: 0.8rem;
				color: var(--color--text-muted);
			}

			.edit-buttons {
				display: flex;
				gap: 0.5rem;
			}
		}
	}

	.comment-actions {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color--border);
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.admin-comment {
		margin-top: 0.5rem;
		padding: 0.5rem 0.75rem;
		background-color: #e3f2fd; /* Light blue background for admin comments */
		border: 1px solid #bbdefb; /* Blue border for admin comments */
		border-radius: 6px;
		font-size: 0.85rem;
		color: #1976d2; /* Darker blue text for admin comments */
		font-style: italic;
	}

	.admin-comment-content {
		margin-bottom: 0.25rem;
	}

	.admin-comment-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.admin-comment-delete-btn {
		color: #dc3545 !important; /* Red color for force delete */
		border-color: #dc3545 !important;

		&:hover {
			background-color: rgba(220, 53, 69, 0.1) !important;
		}
	}

	.admin-note-form {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background: var(--color--card-background);
		border: 1px solid var(--color--border);
		border-radius: 8px;

		textarea {
			width: 100%;
			padding: 0.75rem;
			border: 1px solid var(--color--border);
			border-radius: 6px;
			background: var(--color--background);
			color: var(--color--text);
			font-family: inherit;
			font-size: 0.9rem;
			resize: vertical;
			min-height: 80px;
			margin-bottom: 0.5rem;

			&:focus {
				outline: none;
				border-color: var(--color--primary);
			}

			&::placeholder {
				color: var(--color--text-muted);
			}
		}

		.admin-note-actions {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 0.75rem;

			.char-count {
				font-size: 0.8rem;
				color: var(--color--text-muted);
			}

			.admin-note-buttons {
				display: flex;
				gap: 0.5rem;
			}
		}
	}

	// Custom styling for admin buttons
	.admin-force-delete-btn {
		color: #dc3545 !important; /* Red color for force delete */
		border-color: #dc3545 !important;

		&:hover {
			background-color: rgba(220, 53, 69, 0.1) !important;
		}
	}

	.admin-note-btn {
		color: #fd7e14 !important; /* Orange color for admin notes */
		border-color: #fd7e14 !important;

		&:hover {
			background-color: rgba(253, 126, 20, 0.1) !important;
		}
	}

	.admin-activity-btn {
		color: #6f42c1 !important; /* Purple color for admin activity */
		border-color: #6f42c1 !important;

		&:hover {
			background-color: rgba(111, 66, 193, 0.1) !important;
		}
	}
</style>
