<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';

	onMount(async () => {
		// Re-initialize auth store after OAuth callback
		await auth.initialize();

		// Redirect to home page
		goto('/');
	});
</script>

<svelte:head>
	<title>Signing in... - Extreme Violence</title>
</svelte:head>

<div class="callback-page">
	<div class="container">
		<div class="loading">
			<h2>Signing you in...</h2>
			<p>Please wait while we complete your authentication.</p>
		</div>
	</div>
</div>

<style lang="scss">
	.callback-page {
		background: var(--color--page-background);
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.container {
		text-align: center;
		max-width: 400px;
	}

	.loading {
		h2 {
			margin-bottom: 1rem;
			color: var(--color--text);
		}

		p {
			color: var(--color--text-muted);
		}
	}
</style>
