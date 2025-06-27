<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/atoms/Button.svelte';
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let loading = false;
	let error = '';

	onMount(() => {
		// If user is already logged in, redirect to home
		if ($auth.user) {
			goto('/');
		}
	});

	async function handleGoogleLogin() {
		loading = true;
		error = '';
		try {
			window.location.href = '/api/auth/signin/google';
		} catch (err) {
			error = 'Failed to login with Google';
			console.error('Google login error:', err);
		} finally {
			loading = false;
		}
	}

	async function handleGitHubLogin() {
		loading = true;
		error = '';
		try {
			window.location.href = '/api/auth/signin/github';
		} catch (err) {
			error = 'Failed to login with GitHub';
			console.error('GitHub login error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Extreme Violence</title>
</svelte:head>

<Header />

<main>
	<div class="login-page">
		<div class="container">
			<div class="login-card">
				<h1>Login</h1>
				<p>Choose your preferred login method:</p>

				{#if error}
					<div class="error-message">
						{error}
					</div>
				{/if}

				<div class="login-buttons">
					<Button
						on:click={handleGoogleLogin}
						disabled={loading}
						color="primary"
						size="large"
						style="solid"
					>
						{loading ? 'Loading...' : 'Login with Google'}
					</Button>

					<Button
						on:click={handleGitHubLogin}
						disabled={loading}
						color="secondary"
						size="large"
						style="solid"
					>
						{loading ? 'Loading...' : 'Login with GitHub'}
					</Button>
				</div>

				<div class="back-link">
					<a href="/">← Back to Home</a>
				</div>
			</div>
		</div>
	</div>
</main>

<Footer />

<style lang="scss">
	.login-page {
		background: var(--color--page-background);
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.container {
		width: 100%;
		max-width: 400px;
	}

	.login-card {
		background: var(--color--card-background);
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		text-align: center;

		h1 {
			margin-bottom: 1rem;
			color: var(--color--text);
		}

		p {
			margin-bottom: 2rem;
			color: var(--color--text-muted);
		}
	}

	.login-buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.error-message {
		background: #ff4444;
		color: white;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.back-link {
		a {
			color: var(--color--accent);
			text-decoration: none;
			font-size: 0.9rem;

			&:hover {
				text-decoration: underline;
			}
		}
	}
</style>
