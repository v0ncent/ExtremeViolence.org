<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	onMount(() => {
		// Initialize auth store
		auth.initialize();

		// Check if user is authenticated
		if (!$auth.user) {
			// Redirect to login if not authenticated
			goto('/login');
		}

		// Refresh admin status when page loads
		auth.refreshAdminStatus();
	});

	async function handleSignOut() {
		await auth.signOut();
		goto('/');
	}

	async function refreshAdminStatus() {
		await auth.refreshAdminStatus();
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Profile - Extreme Violence</title>
</svelte:head>

<Header />

<main>
	<div class="profile-page">
		<div class="container">
			{#if $auth.user}
				<div class="profile-card">
					<div class="profile-header">
						<div class="profile-avatar">
							{#if $auth.user.image}
								<img src={$auth.user.image} alt="Profile" class="avatar-image" />
							{:else}
								<div class="avatar-placeholder">
									{$auth.user.name?.charAt(0) || $auth.user.email?.charAt(0) || 'U'}
								</div>
							{/if}
						</div>
						<div class="profile-info">
							<h1>{$auth.user.name || 'User'}</h1>
							<p class="email">{$auth.user.email}</p>
							<div class="provider-badge">
								Signed in with {$auth.user.provider}
							</div>
						</div>
					</div>

					<div class="profile-details">
						<div class="detail-section">
							<h2>Account Information</h2>
							<div class="detail-grid">
								<div class="detail-item">
									<div class="detail-label">User ID</div>
									<span>{$auth.user.id}</span>
								</div>
								<div class="detail-item">
									<div class="detail-label">Email</div>
									<span>{$auth.user.email}</span>
								</div>
								<div class="detail-item">
									<div class="detail-label">Name</div>
									<span>{$auth.user.name || 'Not provided'}</span>
								</div>
								<div class="detail-item">
									<div class="detail-label">Authentication Provider</div>
									<span class="provider-tag">{$auth.user.provider}</span>
								</div>
								<div class="detail-item">
									<div class="detail-label">Admin Status</div>
									<div class="admin-status-container">
										<span class="admin-status {$auth.user.isAdmin ? 'admin' : 'user'}">
											{$auth.user.isAdmin ? 'Administrator' : 'User'}
										</span>
										<button class="refresh-button" on:click={refreshAdminStatus}>
											🔄 Refresh
										</button>
									</div>
								</div>
							</div>
						</div>

						<div class="detail-section">
							<h2>Account Actions</h2>
							<div class="action-buttons">
								<Button color="secondary" size="medium" style="solid" on:click={handleSignOut}>
									Sign Out
								</Button>
								<a href="/" class="home-link">
									<Button color="primary" size="medium" style="understated">Back to Home</Button>
								</a>
							</div>
						</div>
					</div>
				</div>
			{:else if $auth.loading}
				<div class="loading">
					<p>Loading profile...</p>
				</div>
			{:else}
				<div class="loading">
					<p>Redirecting to login...</p>
				</div>
			{/if}
		</div>
	</div>
</main>

<Footer />

<style lang="scss">
	.profile-page {
		background: var(--color--page-background);
		min-height: 60vh;
		padding: 2rem 1rem;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	.profile-card {
		background: var(--color--card-background);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.profile-header {
		background: linear-gradient(135deg, var(--color--primary) 0%, var(--color--secondary) 100%);
		color: white;
		padding: 2rem;
		display: flex;
		align-items: center;
		gap: 2rem;

		.profile-avatar {
			.avatar-image {
				width: 80px;
				height: 80px;
				border-radius: 50%;
				object-fit: cover;
				border: 4px solid rgba(255, 255, 255, 0.3);
			}

			.avatar-placeholder {
				width: 80px;
				height: 80px;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.2);
				color: white;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: 600;
				font-size: 2rem;
				border: 4px solid rgba(255, 255, 255, 0.3);
			}
		}

		.profile-info {
			flex: 1;

			h1 {
				margin: 0 0 0.5rem 0;
				font-size: 1.75rem;
				font-weight: 600;
			}

			.email {
				margin: 0 0 1rem 0;
				opacity: 0.9;
				font-size: 1rem;
			}

			.provider-badge {
				display: inline-block;
				background: rgba(255, 255, 255, 0.2);
				padding: 0.25rem 0.75rem;
				border-radius: 20px;
				font-size: 0.875rem;
				font-weight: 500;
				text-transform: capitalize;
			}
		}
	}

	.profile-details {
		padding: 2rem;

		.detail-section {
			margin-bottom: 2rem;

			&:last-child {
				margin-bottom: 0;
			}

			h2 {
				margin: 0 0 1rem 0;
				color: var(--color--text);
				font-size: 1.25rem;
				font-weight: 600;
			}
		}

		.detail-grid {
			display: grid;
			gap: 1rem;

			.detail-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 1rem;
				background: var(--color--background);
				border-radius: 8px;
				border: 1px solid var(--color--border);

				.detail-label {
					font-weight: 500;
					color: var(--color--text-muted);
					font-size: 0.875rem;
				}

				span {
					color: var(--color--text);
					font-weight: 500;
				}

				.provider-tag {
					background: var(--color--primary);
					color: white;
					padding: 0.25rem 0.75rem;
					border-radius: 20px;
					font-size: 0.75rem;
					text-transform: capitalize;
				}

				.admin-status {
					padding: 0.25rem 0.75rem;
					border-radius: 20px;
					font-size: 0.75rem;
					font-weight: 500;

					&.admin {
						background: #10b981;
						color: white;
					}

					&.user {
						background: var(--color--text-muted);
						color: white;
					}
				}
			}
		}

		.action-buttons {
			display: flex;
			gap: 1rem;
			flex-wrap: wrap;

			.home-link {
				text-decoration: none;
			}
		}
	}

	.loading {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color--text-muted);
	}

	.admin-status-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.refresh-button {
		background: var(--color--accent);
		color: white;
		border: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;

		&:hover {
			background: var(--color--accent-hover);
		}
	}

	@media (max-width: 768px) {
		.profile-header {
			flex-direction: column;
			text-align: center;
			gap: 1rem;

			.profile-info {
				h1 {
					font-size: 1.5rem;
				}
			}
		}

		.detail-grid {
			.detail-item {
				flex-direction: column;
				align-items: flex-start;
				gap: 0.5rem;

				.detail-label {
					font-size: 0.75rem;
				}
			}
		}

		.action-buttons {
			flex-direction: column;

			.home-link {
				width: 100%;
			}
		}
	}
</style>
