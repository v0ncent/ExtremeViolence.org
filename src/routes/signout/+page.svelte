<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { signOut } from '@auth/sveltekit/client';
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	onMount(() => {
		// Automatically redirect to sign out after a brief delay
		setTimeout(async () => {
			await signOut({ callbackUrl: '/' });
		}, 1000);
	});

	async function handleSignOut() {
		await signOut({ callbackUrl: '/' });
	}

	function handleCancel() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Sign Out - Extreme Violence</title>
</svelte:head>

<Header />

<main>
	<div class="signout-page">
		<div class="container">
			<div class="signout-card">
				<h1>Sign Out</h1>
				<p>You are being signed out...</p>

				<div class="buttons">
					<Button on:click={handleSignOut} color="primary" size="medium" style="solid">
						Sign Out Now
					</Button>

					<Button on:click={handleCancel} color="secondary" size="medium" style="understated">
						Cancel
					</Button>
				</div>
			</div>
		</div>
	</div>
</main>

<Footer />

<style lang="scss">
	.signout-page {
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

	.signout-card {
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

	.buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
</style>
