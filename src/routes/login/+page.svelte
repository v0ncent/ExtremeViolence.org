<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';

	let loading = false;

	onMount(() => {
		// Check if user is already logged in by checking for auth cookies
		// For now, we'll assume they need to log in
		loading = false;
	});

	async function handleGoogleSignIn() {
		loading = true;
		window.location.href = '/auth/google';
	}

	async function handleGitHubSignIn() {
		loading = true;
		window.location.href = '/auth/github';
	}

	async function handleSignOut() {
		await fetch('/auth/signout', { method: 'POST' });
		window.location.href = '/';
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
				<div class="login-content">
					<h1>Welcome Back</h1>
					<p>Sign in to your account to continue</p>

					{#if loading}
						<div class="loading">
							<p>Signing you in...</p>
						</div>
					{:else}
						<div class="login-options">
							<button on:click={handleGoogleSignIn} class="login-button google">
								Continue with Google
							</button>
							<button on:click={handleGitHubSignIn} class="login-button github">
								Continue with GitHub
							</button>
						</div>
					{/if}
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
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.login-content {
		text-align: center;
		padding: 2rem;

		h1 {
			margin-bottom: 0.5rem;
			color: var(--color--text);
		}

		p {
			margin-bottom: 2rem;
			color: var(--color--text-muted);
		}
	}

	.loading {
		padding: 2rem;
		color: var(--color--text-muted);
	}

	.login-options {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.login-button {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.75rem;
			width: 100%;
			padding: 0.75rem 1.5rem;
			border: none;
			border-radius: 8px;
			font-size: 1rem;
			font-weight: 500;
			cursor: pointer;
			transition: background-color 0.2s ease;

			&.google {
				background: #4285f4;
				color: white;

				&:hover {
					background: #3367d6;
				}
			}

			&.github {
				background: #24292e;
				color: white;

				&:hover {
					background: #1b1f23;
				}
			}
		}
	}

	.signout-button {
		background: var(--color--secondary);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s ease;

		&:hover {
			background: var(--color--secondary-dark);
		}
	}
</style>
