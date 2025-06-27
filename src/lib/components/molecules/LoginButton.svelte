<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Button from '$lib/components/atoms/Button.svelte';
	import { onMount, onDestroy } from 'svelte';

	let loading = false;
	let showDropdown = false;
	let dropdownElement: HTMLDivElement;

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
			showDropdown = false;
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	async function handleGoogleLogin() {
		loading = true;
		showDropdown = false;
		try {
			// Redirect to Google OAuth
			window.location.href = '/api/auth/signin/google';
		} catch (error) {
			console.error('Google login error:', error);
			auth.setError('Failed to login with Google');
		} finally {
			loading = false;
		}
	}

	async function handleGitHubLogin() {
		loading = true;
		showDropdown = false;
		try {
			// Redirect to GitHub OAuth
			window.location.href = '/api/auth/signin/github';
		} catch (error) {
			console.error('GitHub login error:', error);
			auth.setError('Failed to login with GitHub');
		} finally {
			loading = false;
		}
	}

	function handleLogout() {
		auth.logout();
		goto('/');
	}

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}
</script>

<div class="login-container">
	{#if $auth.user}
		<div class="user-info">
			<img src={$auth.user.image || '/images/default-avatar.png'} alt="Profile" class="avatar" />
			<span class="username">{$auth.user.name}</span>
			{#if $auth.user.isAdmin}
				<span class="admin-badge">Admin</span>
			{/if}
			<Button on:click={handleLogout} disabled={loading}>Logout</Button>
		</div>
	{:else}
		<div class="login-dropdown" bind:this={dropdownElement}>
			<Button on:click={toggleDropdown} disabled={loading} color="primary" style="solid">
				{loading ? 'Loading...' : 'Login'}
			</Button>

			{#if showDropdown}
				<div class="dropdown-menu">
					<button class="dropdown-item" on:click={handleGoogleLogin} disabled={loading}>
						Login with Google
					</button>
					<button class="dropdown-item" on:click={handleGitHubLogin} disabled={loading}>
						Login with GitHub
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.login-container {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.avatar {
			width: 32px;
			height: 32px;
			border-radius: 50%;
			object-fit: cover;
		}

		.username {
			font-weight: 500;
			color: var(--color--text);
		}

		.admin-badge {
			background: var(--color--accent);
			color: white;
			padding: 0.25rem 0.5rem;
			border-radius: 4px;
			font-size: 0.75rem;
			font-weight: 500;
		}
	}

	.login-dropdown {
		position: relative;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
		background: var(--color--card-background);
		border: 1px solid var(--color--border);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 180px;
		z-index: 1000;
		overflow: hidden;
	}

	.dropdown-item {
		display: block;
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		color: var(--color--text);
		text-align: left;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s;

		&:hover {
			background: var(--color--hover);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}

		&:not(:last-child) {
			border-bottom: 1px solid var(--color--border);
		}
	}
</style>
