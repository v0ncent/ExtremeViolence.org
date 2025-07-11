<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import Button from '$lib/components/atoms/Button.svelte';
	import { onMount } from 'svelte';
	import { NewsService } from '$lib/services/newsService';
	import type { PostComment, UserContentComment } from '$lib/utils/types';

	export let postSlug: string;
	export let postId: string;

	// Special creator account details
	const CREATOR_EMAIL = 'vincentlikesrobots@gmail.com';
	const CREATOR_USER_ID = 'b1f16a98-7540-4ab8-9201-bca6a44e0b19';

	// Remove local Comment interface and use backend types for mapping
	let comments: PostComment[] = [];
	let newComment = '';
	let isSubmitting = false;
	let currentUser: any = null;

	onMount(async () => {
		const unsubscribe = auth.subscribe(($auth) => {
			if ($auth.user) {
				currentUser = $auth.user;
				console.log('Current user:', currentUser);
			}
		});

		// Load existing comments from database
		await loadComments();

		return unsubscribe;
	});

	async function loadComments() {
		try {
			const post = await NewsService.getPostById(postId);
			if (post) {
				comments = post.comments;
			}
		} catch (error) {
			console.error('Error loading comments:', error);
		}
	}

	async function addComment() {
		if (!newComment.trim() || !currentUser || isSubmitting) return;

		isSubmitting = true;

		try {
			// Add comment to database
			const success = await NewsService.addComment(
				postId,
				currentUser.userId || currentUser.id,
				newComment.trim()
			);

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
</script>

<div class="comments-section">
	<h3>Comments ({comments.length})</h3>

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
		{:else}
			{#each comments as comment (comment.date)}
				{#if comment.userId === CREATOR_USER_ID}
					<div class="comment creator-comment-author" style="position: relative;">
						<div class="roaring-flame-background">
							<div class="flame-layer flame-layer-1" />
							<div class="flame-layer flame-layer-2" />
							<div class="flame-layer flame-layer-3" />
							<div class="flame-layer flame-layer-4" />
						</div>
						<div class="comment-header">
							<span class="username creator-name">{comment.userId}</span>
							<span class="comment-date">{formatDate(comment.date)}</span>
						</div>
						<div class="comment-content">
							<p>{comment.text}</p>
						</div>
					</div>
				{:else}
					<div class="comment">
						<div class="comment-header">
							<span class="username">{comment.userId}</span>
							<span class="comment-date">{formatDate(comment.date)}</span>
						</div>
						<div class="comment-content">
							<p>{comment.text}</p>
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	@import '$lib/scss/_mixins.scss';

	.comments-section {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color--border);

		h3 {
			margin: 0 0 1.5rem 0;
			color: var(--color--text);
			font-size: 1.25rem;
			font-weight: 600;
		}
	}

	.comment-form {
		background: var(--color--card-background);
		border: 1px solid var(--color--border);
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;

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
		.no-comments {
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
		padding: 1.5rem;
		margin-bottom: 1rem;

		&:last-child {
			margin-bottom: 0;
		}

		.comment-header {
			margin-bottom: 1rem;

			.comment-author {
				display: flex;
				align-items: center;
				gap: 0.75rem;

				.author-avatar {
					.avatar-image {
						width: 52px;
						height: 52px;
						border-radius: 50%;
						object-fit: cover;
					}

					.avatar-placeholder {
						width: 52px;
						height: 52px;
						border-radius: 50%;
						background: var(--color--primary);
						color: white;
						display: flex;
						align-items: center;
						justify-content: center;
						font-weight: 600;
						font-size: 1.2rem;
					}
				}

				.author-info {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					flex-wrap: wrap;

					.author-name {
						font-weight: 500;
						color: var(--color--text);
					}

					.admin-badge {
						background: #e67e22;
						color: #fff;
						padding: 0.15em 0.6em;
						border-radius: 1em;
						font-size: 0.75em;
					}

					.comment-date {
						font-size: 0.8rem;
						color: var(--color--text-muted);
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
	.creator-comment-author {
		position: relative;
		z-index: 1;
	}

	.roaring-flame-background {
		position: absolute;
		top: -10px;
		left: -10px;
		right: -10px;
		bottom: -10px;
		pointer-events: none;
		z-index: -1;
		overflow: hidden;
		border-radius: 8px;
		max-width: 200px;
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
</style>
