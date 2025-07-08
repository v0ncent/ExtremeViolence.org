<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	type UserData = {
		_id?: number;
		userId: string;
		email: string;
		authProvider: string;
		isAdmin: boolean;
		imagePath?: string;
		userName?: string;
	};

	let allUsers: UserData[] = [];
	let username = '';
	let usernameError = '';
	let isAdmin = false;
	let imagePath = '';
	let newProfilePhoto: File | null = null;
	let saveSuccess = false;
	let currentUser: UserData | null = null;
	let loading = true;

	async function fetchAllUsers() {
		try {
			const res = await fetch('http://localhost:8080/userData/getall');
			if (!res.ok) throw new Error('Failed to fetch users');
			const data = await res.json();
			if (Array.isArray(data)) {
				allUsers = data.map((u) => ({
					...u,
					isAdmin: u.isAdmin ?? u.admin // use isAdmin if present, else admin
				}));
			} else {
				allUsers = [];
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				console.error('Error fetching all users:', e, e.message, e.stack);
			} else {
				console.error('Error fetching all users:', e);
			}
			allUsers = [];
		}
	}

	function isUsernameUnique(name: string): boolean {
		if (!currentUser) return false;
		return !allUsers.some((u) => u.userName === name && u.userId !== currentUser?.userId);
	}

	async function handleProfilePhotoUpload(): Promise<string> {
		if (!newProfilePhoto) return imagePath;
		// Placeholder: You need a backend endpoint to handle this!
		return `/images/profilephotos/${newProfilePhoto.name}`;
	}

	async function saveProfile() {
		usernameError = '';
		saveSuccess = false;
		if (!currentUser) return;
		if (!isUsernameUnique(username)) {
			usernameError = 'Username already taken.';
			return;
		}
		const updatedImagePath = await handleProfilePhotoUpload();
		try {
			// Update userName
			const resUserName = await fetch(
				`http://localhost:8080/userData/update/userId/${
					currentUser.userId
				}/userName/${encodeURIComponent(username)}`,
				{
					method: 'PUT'
				}
			);
			if (!resUserName.ok) {
				usernameError = 'Failed to update username.';
				console.error('Failed to update username:', await resUserName.text());
				return;
			}
			// Update imagePath
			const resImage = await fetch(
				`http://localhost:8080/userData/update/userId/${
					currentUser.userId
				}/imagePath/${encodeURIComponent(updatedImagePath)}`,
				{
					method: 'PUT'
				}
			);
			if (!resImage.ok) {
				usernameError = 'Failed to update profile image.';
				console.error('Failed to update profile image:', await resImage.text());
				return;
			}
			imagePath = updatedImagePath;
			saveSuccess = true;
			await fetchAllUsers();

			// Fetch the latest user profile from backend and update the auth store
			try {
				const res = await fetch('http://localhost:8080/userData/getall');
				if (res.ok && currentUser) {
					const allUsers: UserData[] = await res.json();
					const backendUser = allUsers.find((u: UserData) => u.email === currentUser!.email);
					if (backendUser && auth && auth.setUser && $auth.user) {
						auth.setUser({
							...$auth.user,
							userName: backendUser.userName || '',
							imagePath: backendUser.imagePath || '',
							image: backendUser.imagePath || $auth.user.image || ''
						});
					}
				}
			} catch (e) {
				console.error('Failed to fetch updated user profile:', e);
			}
		} catch (e) {
			usernameError = e instanceof Error ? e.message : 'Failed to update profile.';
			console.error('Error updating profile:', e);
		}
	}

	async function handleSignOut() {
		await auth.signOut();
		goto('/');
	}

	function onPhotoChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			newProfilePhoto = target.files[0];
		}
	}

	onMount(async () => {
		auth.initialize();
		const unsubscribe = auth.subscribe(async ($auth) => {
			if (!$auth.user) {
				goto('/login');
				return;
			}
			loading = true;
			await fetchAllUsers();
			const userEmail = $auth.user?.email;
			const backendUser = userEmail ? allUsers.find((u) => u.email === userEmail) : null;
			if (backendUser) {
				currentUser = backendUser;
				username = backendUser.userName || backendUser.email.split('@')[0];
				isAdmin = backendUser.isAdmin;
				imagePath = backendUser.imagePath || '';
			}
			loading = false;
		});
		return () => unsubscribe();
	});
</script>

<svelte:head>
	<title>Profile - Extreme Violence</title>
</svelte:head>

<Header />

<main>
	<div class="profile-page">
		<div class="container">
			{#if loading}
				<div class="loading">
					<p>Loading profile...</p>
				</div>
			{:else if currentUser}
				<div class="profile-card">
					<div class="profile-header">
						<div class="profile-avatar">
							{#if imagePath}
								<img src={imagePath} alt="Profile" class="avatar-image" />
							{:else}
								<div class="avatar-placeholder">
									{currentUser.email.charAt(0).toUpperCase()}
								</div>
							{/if}
						</div>
						<div class="profile-info">
							<h1>{username}</h1>
							{#if isAdmin}
								<span class="admin-badge">Admin</span>
							{/if}
						</div>
					</div>

					<div class="profile-details">
						<div class="detail-section">
							<h2>Account Information</h2>
							<div class="detail-grid">
								<div class="detail-item">
									<div class="detail-label">User ID</div>
									<span>{currentUser.userId}</span>
								</div>
								<div class="detail-item">
									<div class="detail-label">Email</div>
									<span>{currentUser.email}</span>
								</div>
								<div class="detail-item">
									<div class="detail-label">Username</div>
									<input bind:value={username} />
									{#if usernameError}
										<span class="error">{usernameError}</span>
									{/if}
								</div>
								<div class="detail-item">
									<div class="detail-label">Profile Photo</div>
									<label class="file-upload-label">
										<input
											type="file"
											accept="image/*"
											on:change={onPhotoChange}
											style="display: none;"
										/>
										<span class="file-upload-button">Choose Photo</span>
									</label>
								</div>
							</div>
						</div>

						<div class="detail-section">
							<h2>Account Actions</h2>
							<div class="action-buttons">
								<Button color="primary" size="medium" style="solid" on:click={saveProfile}>
									Save Profile
								</Button>
								{#if saveSuccess}
									<span class="success">Profile updated!</span>
								{/if}
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
			{:else}
				<div class="loading">
					<p>Could not load profile. Please try again.</p>
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

	.admin-badge {
		background: #e67e22;
		color: #fff;
		padding: 0.2em 0.7em;
		border-radius: 1em;
		font-size: 0.9em;
		margin-left: 1em;
	}
	.error {
		color: #e74c3c;
		font-size: 0.9em;
		margin-left: 0.5em;
	}
	.success {
		color: #27ae60;
		font-size: 0.9em;
		margin-left: 0.5em;
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
