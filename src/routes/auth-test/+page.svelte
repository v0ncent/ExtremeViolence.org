<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';

	let userData: any = null;
	let loading = true;

	onMount(async () => {
		try {
			// Initialize auth store
			await auth.initialize();

			// Get user data
			const response = await fetch('/api/auth/user');
			userData = await response.json();
		} catch (error) {
			console.error('Error loading auth data:', error);
		} finally {
			loading = false;
		}
	});

	async function handleSignOut() {
		try {
			await fetch('/auth/signout', { method: 'POST' });
			window.location.reload();
		} catch (error) {
			console.error('Sign out error:', error);
		}
	}
</script>

<svelte:head>
	<title>Auth Test - Extreme Violence</title>
</svelte:head>

<div class="auth-test-page">
	<div class="container">
		<h1>Lucia Authentication Test</h1>

		{#if loading}
			<div class="loading">
				<p>Loading authentication information...</p>
			</div>
		{:else}
			<div class="test-sections">
				<!-- Auth Store Status -->
				<div class="test-section">
					<h2>Auth Store Status</h2>
					<div class="auth-status">
						<p><strong>Loading:</strong> {$auth.loading}</p>
						<p><strong>Initialized:</strong> {$auth.initialized}</p>
						<p><strong>User:</strong> {$auth.user ? 'Logged in' : 'Not logged in'}</p>
						{#if $auth.user}
							<div class="user-info">
								<p><strong>Email:</strong> {$auth.user.email}</p>
								<p><strong>Name:</strong> {$auth.user.name}</p>
								<p><strong>Provider:</strong> {$auth.user.provider}</p>
								<p><strong>Admin:</strong> {$auth.user.isAdmin}</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- API Response -->
				<div class="test-section">
					<h2>API Response</h2>
					{#if userData}
						<pre>{JSON.stringify(userData, null, 2)}</pre>
					{:else}
						<div class="error">Failed to load user data</div>
					{/if}
				</div>

				<!-- Actions -->
				<div class="test-section">
					<h2>Actions</h2>
					<div class="actions">
						{#if $auth.user}
							<button class="btn btn-secondary" on:click={handleSignOut}>Sign Out</button>
						{:else}
							<a href="/login" class="btn btn-primary">Go to Login</a>
						{/if}
						<button class="btn btn-secondary" on:click={() => window.location.reload()}
							>Refresh Page</button
						>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.auth-test-page {
		background: #f5f5f5;
		min-height: 100vh;
		padding: 2rem 1rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
		color: #333;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.test-sections {
		display: grid;
		gap: 2rem;
	}

	.test-section {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

		h2 {
			margin-top: 0;
			margin-bottom: 1rem;
			color: #333;
		}
	}

	.auth-status {
		p {
			margin: 0.5rem 0;
		}

		.user-info {
			margin-top: 1rem;
			padding: 1rem;
			background: #f8f9fa;
			border-radius: 4px;
		}
	}

	pre {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.875rem;
	}

	.error {
		color: #dc3545;
		padding: 1rem;
		background: #f8d7da;
		border-radius: 4px;
	}

	.actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		text-decoration: none;
		display: inline-block;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s;

		&.btn-primary {
			background: #007bff;
			color: white;

			&:hover {
				background: #0056b3;
			}
		}

		&.btn-secondary {
			background: #6c757d;
			color: white;

			&:hover {
				background: #545b62;
			}
		}
	}
</style>
