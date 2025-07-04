<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';

	let envCheck: any = null;
	let debugInfo: any = null;
	let sessionInfo: any = null;
	let envTest: any = null;
	let loading = true;

	onMount(async () => {
		try {
			// Check environment variables
			const envResponse = await fetch('/api/auth/check-env');
			envCheck = await envResponse.json();

			// Check detailed environment test
			const envTestResponse = await fetch('/api/auth/test-env');
			envTest = await envTestResponse.json();

			// Check debug info
			const debugResponse = await fetch('/api/auth/debug');
			debugInfo = await debugResponse.json();

			// Check session info
			const sessionResponse = await fetch('/api/auth/user-session');
			sessionInfo = await sessionResponse.json();
		} catch (error) {
			console.error('Error loading auth test data:', error);
		} finally {
			loading = false;
		}
	});

	async function signIn() {
		window.location.href = '/auth/signin/google';
	}

	async function signOut() {
		await auth.signOut();
		window.location.reload();
	}

	async function clearSession() {
		try {
			await fetch('/api/auth/clear-session', { method: 'POST' });
			window.location.reload();
		} catch (error) {
			console.error('Error clearing session:', error);
		}
	}
</script>

<svelte:head>
	<title>Auth Test - Extreme Violence</title>
</svelte:head>

<div class="auth-test-page">
	<div class="container">
		<h1>Authentication Test Page</h1>

		{#if loading}
			<div class="loading">
				<p>Loading authentication information...</p>
			</div>
		{:else}
			<div class="test-sections">
				<!-- Environment Variables -->
				<div class="test-section">
					<h2>Environment Variables</h2>
					{#if envCheck}
						<div class="status {envCheck.allRequired ? 'success' : 'error'}">
							{envCheck.message}
						</div>
						<pre>{JSON.stringify(envCheck.envCheck, null, 2)}</pre>
					{:else}
						<div class="error">Failed to load environment check</div>
					{/if}
				</div>

				<!-- Detailed Environment Test -->
				<div class="test-section">
					<h2>Detailed Environment Test</h2>
					{#if envTest}
						<div class="status {envTest.envInfo.AUTH_SECRET.isValid ? 'success' : 'error'}">
							{envTest.message}
						</div>
						<p><strong>Recommendation:</strong> {envTest.recommendation}</p>
						<pre>{JSON.stringify(envTest.envInfo, null, 2)}</pre>
					{:else}
						<div class="error">Failed to load detailed environment test</div>
					{/if}
				</div>

				<!-- Debug Information -->
				<div class="test-section">
					<h2>Session Debug</h2>
					{#if debugInfo}
						<pre>{JSON.stringify(debugInfo, null, 2)}</pre>
					{:else}
						<div class="error">Failed to load debug info</div>
					{/if}
				</div>

				<!-- Session Information -->
				<div class="test-section">
					<h2>Current Session</h2>
					{#if sessionInfo}
						<pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
					{:else}
						<div class="error">Failed to load session info</div>
					{/if}
				</div>

				<!-- Auth Store -->
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

				<!-- Actions -->
				<div class="test-section">
					<h2>Actions</h2>
					<div class="actions">
						{#if $auth.user}
							<button class="btn btn-secondary" on:click={signOut}>Sign Out</button>
						{:else}
							<button class="btn btn-primary" on:click={signIn}>Sign In with Google</button>
						{/if}
						<button class="btn btn-secondary" on:click={clearSession}>Clear Session Cookies</button>
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
		background: var(--color--page-background);
		min-height: 100vh;
		padding: 2rem 1rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	h1 {
		color: var(--color--text);
		margin-bottom: 2rem;
		text-align: center;
	}

	.loading {
		text-align: center;
		color: var(--color--text-muted);
	}

	.test-sections {
		display: grid;
		gap: 2rem;
	}

	.test-section {
		background: var(--color--card-background);
		border: 1px solid var(--color--border);
		border-radius: 8px;
		padding: 1.5rem;

		h2 {
			color: var(--color--text);
			margin-bottom: 1rem;
			font-size: 1.25rem;
		}
	}

	.status {
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		font-weight: 500;

		&.success {
			background: #d4edda;
			color: #155724;
			border: 1px solid #c3e6cb;
		}

		&.error {
			background: #f8d7da;
			color: #721c24;
			border: 1px solid #f5c6cb;
		}
	}

	pre {
		background: var(--color--code-background);
		border: 1px solid var(--color--border);
		border-radius: 4px;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.875rem;
		color: var(--color--text);
	}

	.auth-status {
		color: var(--color--text);

		.user-info {
			margin-top: 1rem;
			padding: 1rem;
			background: var(--color--code-background);
			border-radius: 4px;
		}
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
		cursor: pointer;
		font-weight: 500;
		text-decoration: none;
		display: inline-block;

		&.btn-primary {
			background: var(--color--primary);
			color: white;

			&:hover {
				background: var(--color--primary-hover);
			}
		}

		&.btn-secondary {
			background: var(--color--secondary);
			color: var(--color--text);

			&:hover {
				background: var(--color--secondary-hover);
			}
		}
	}
</style>
