<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';

	let session: any;
	let loading = true;

	onMount(async () => {
		try {
			const response = await fetch('/api/auth/session');
			session = await response.json();
			loading = false;

			// If user is already logged in, redirect to home
			if (session?.user) {
				goto('/');
			}
		} catch (error) {
			console.error('Failed to get session:', error);
			loading = false;
		}
	});

	async function handleGoogleSignIn() {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/api/auth/signin/google';

		const callbackUrl = document.createElement('input');
		callbackUrl.type = 'hidden';
		callbackUrl.name = 'callbackUrl';
		callbackUrl.value = '/';

		form.appendChild(callbackUrl);
		document.body.appendChild(form);
		form.submit();
	}

	async function handleGitHubSignIn() {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/api/auth/signin/github';

		const callbackUrl = document.createElement('input');
		callbackUrl.type = 'hidden';
		callbackUrl.name = 'callbackUrl';
		callbackUrl.value = '/';

		form.appendChild(callbackUrl);
		document.body.appendChild(form);
		form.submit();
	}

	async function handleSignOut() {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/api/auth/signout';

		const callbackUrl = document.createElement('input');
		callbackUrl.type = 'hidden';
		callbackUrl.name = 'callbackUrl';
		callbackUrl.value = '/';

		form.appendChild(callbackUrl);
		document.body.appendChild(form);
		form.submit();
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
							<p>Loading...</p>
						</div>
					{:else if session?.user}
						<div class="logged-in">
							<div class="user-info">
								{#if session.user.image}
									<img src={session.user.image} alt="Profile" class="profile-image" />
								{/if}
								<div>
									<h3>Welcome, {session.user.name}!</h3>
									<p>You're signed in via {session.provider}</p>
								</div>
							</div>
							<button on:click={handleSignOut} class="signout-button"> Sign Out </button>
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

	.logged-in {
		.user-info {
			display: flex;
			align-items: center;
			gap: 1rem;
			margin-bottom: 1.5rem;
			justify-content: center;

			.profile-image {
				width: 48px;
				height: 48px;
				border-radius: 50%;
				object-fit: cover;
			}

			h3 {
				margin: 0;
				color: var(--color--text);
			}

			p {
				margin: 0;
				color: var(--color--text-muted);
				font-size: 0.9rem;
			}
		}
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
